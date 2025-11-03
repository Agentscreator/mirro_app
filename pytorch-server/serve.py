"""
PyTorch Model Server for Aesthetic Layout Scoring

This is a template for when you're ready to deploy a real PyTorch model.
Currently, the app uses heuristic scoring, but this shows how to integrate
a CLIP-based or custom aesthetic model.

Requirements:
    pip install torch torchvision transformers pillow flask flask-cors

Usage:
    python pytorch-server/serve.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

# Load CLIP model for aesthetic scoring
print("Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"Model loaded on {device}")

# Aesthetic quality prompts
AESTHETIC_PROMPTS = [
    "a beautiful, well-designed, professional layout",
    "an aesthetically pleasing, balanced composition",
    "a harmonious, visually appealing design",
    "a cluttered, unbalanced, poorly designed layout",
    "an unappealing, messy composition"
]


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'CLIP-ViT-B/32',
        'device': device
    })


@app.route('/score', methods=['POST'])
def score_layout():
    """
    Score a layout's aesthetic quality
    
    Request body:
    {
        "image": "base64_encoded_image",  # Screenshot of the layout
        "variant": {
            "gradient": "...",
            "font": "...",
            "layout": "..."
        },
        "eventData": {
            "title": "...",
            "description": "..."
        }
    }
    
    Response:
    {
        "aestheticScore": 85,
        "compositionScore": 82,
        "colorHarmonyScore": 88,
        "balanceScore": 80,
        "reasoning": "..."
    }
    """
    try:
        data = request.json
        
        # Decode image
        if 'image' in data:
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
            
            # Score using CLIP
            aesthetic_score = score_with_clip(image)
        else:
            # Fallback to heuristic scoring if no image provided
            aesthetic_score = 75
        
        # Get variant and event data
        variant = data.get('variant', {})
        event_data = data.get('eventData', {})
        
        # Calculate component scores
        composition_score = score_composition(variant)
        color_harmony_score = score_color_harmony(variant)
        balance_score = score_balance(variant, event_data)
        
        # Generate reasoning
        reasoning = generate_reasoning(
            aesthetic_score,
            composition_score,
            color_harmony_score,
            balance_score
        )
        
        return jsonify({
            'aestheticScore': int(aesthetic_score),
            'compositionScore': composition_score,
            'colorHarmonyScore': color_harmony_score,
            'balanceScore': balance_score,
            'reasoning': reasoning
        })
        
    except Exception as e:
        print(f"Error scoring layout: {e}")
        return jsonify({'error': str(e)}), 500


def score_with_clip(image):
    """
    Score image aesthetic quality using CLIP
    
    Returns a score from 0-100 based on how well the image matches
    positive aesthetic prompts vs negative ones.
    """
    try:
        # Prepare inputs
        inputs = processor(
            text=AESTHETIC_PROMPTS,
            images=image,
            return_tensors="pt",
            padding=True
        ).to(device)
        
        # Get CLIP scores
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Calculate aesthetic score
        # Higher weight for positive prompts (0-2), lower for negative (3-4)
        positive_score = probs[0, :3].sum().item()
        negative_score = probs[0, 3:].sum().item()
        
        # Convert to 0-100 scale
        aesthetic_score = (positive_score / (positive_score + negative_score)) * 100
        
        return aesthetic_score
        
    except Exception as e:
        print(f"Error in CLIP scoring: {e}")
        return 75  # Fallback score


def score_composition(variant):
    """Score layout composition"""
    layout_scores = {
        'centered': 85,
        'left-aligned': 75,
        'split': 80,
        'overlay': 70
    }
    return layout_scores.get(variant.get('layout', 'centered'), 75)


def score_color_harmony(variant):
    """Score color harmony"""
    # Extract colors from gradient
    gradient = variant.get('gradient', '')
    
    # Simple color harmony scoring
    if 'purple' in gradient and 'pink' in gradient:
        return 88
    elif 'blue' in gradient and 'indigo' in gradient:
        return 90
    elif 'green' in gradient and 'emerald' in gradient:
        return 87
    else:
        return 75


def score_balance(variant, event_data):
    """Score visual balance"""
    score = 70
    
    if variant.get('layout') == 'centered':
        score += 15
    
    title_length = len(event_data.get('title', ''))
    if 10 < title_length < 40:
        score += 10
    
    return min(100, score)


def generate_reasoning(aesthetic, composition, color, balance):
    """Generate human-readable reasoning"""
    reasons = []
    
    if aesthetic >= 85:
        reasons.append("Excellent overall aesthetic quality")
    elif aesthetic >= 75:
        reasons.append("Strong visual appeal")
    else:
        reasons.append("Good aesthetic foundation")
    
    if composition >= 80:
        reasons.append("well-balanced composition")
    if color >= 85:
        reasons.append("harmonious color palette")
    if balance >= 80:
        reasons.append("excellent visual balance")
    
    return ", ".join(reasons)


if __name__ == '__main__':
    print("\n" + "="*50)
    print("PyTorch Aesthetic Scoring Server")
    print("="*50)
    print(f"Device: {device}")
    print(f"Model: CLIP-ViT-B/32")
    print(f"Endpoint: http://localhost:5000/score")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
