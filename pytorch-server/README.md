# PyTorch Model Server

This directory contains the PyTorch model server for aesthetic layout scoring.

## Current Status

⚠️ **Not Required Yet**: The app currently uses heuristic scoring and doesn't need this server.

This is provided as a template for when you're ready to deploy a real PyTorch model.

## When to Use This

Use this server when you want to:
- Replace heuristic scoring with actual ML model predictions
- Use CLIP for image-based aesthetic evaluation
- Train a custom model on your event designs
- Leverage GPU acceleration for scoring

## Setup

### 1. Install Dependencies

```bash
cd pytorch-server
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python serve.py
```

The server will start on `http://localhost:5000`

### 3. Update Your Next.js API

Modify `app/api/pytorch/score-layout/route.ts` to call this server:

```typescript
// Instead of heuristic scoring, call the PyTorch server
const response = await fetch('http://localhost:5000/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: layoutScreenshot, // base64 encoded
    variant,
    eventData
  })
})

const score = await response.json()
```

## API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "model": "CLIP-ViT-B/32",
  "device": "cuda"
}
```

### Score Layout
```bash
POST http://localhost:5000/score
```

Request:
```json
{
  "image": "base64_encoded_screenshot",
  "variant": {
    "gradient": "bg-gradient-to-br from-purple-500 to-pink-600",
    "font": "font-bold",
    "layout": "centered"
  },
  "eventData": {
    "title": "Summer Music Festival",
    "description": "An amazing outdoor concert"
  }
}
```

Response:
```json
{
  "aestheticScore": 85,
  "compositionScore": 82,
  "colorHarmonyScore": 88,
  "balanceScore": 80,
  "reasoning": "Excellent overall aesthetic quality, harmonious color palette"
}
```

## Model Options

### Option 1: CLIP (Current)
- Pre-trained vision-language model
- Good for general aesthetic evaluation
- No training required

### Option 2: NIMA (Neural Image Assessment)
- Specialized for aesthetic quality prediction
- Trained on AVA dataset
- Better for pure aesthetics

### Option 3: Custom Model
- Train on your own event designs
- Learn user preferences
- Best long-term solution

## Deployment

### Development
```bash
python serve.py
```

### Production Options

#### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY serve.py .
CMD ["python", "serve.py"]
```

#### AWS Lambda
Use AWS Lambda with PyTorch layer for serverless deployment.

#### Hugging Face Inference API
Deploy model to Hugging Face and call their API.

## Performance

### Local (CPU)
- ~500ms per layout
- Good for development

### Local (GPU)
- ~100ms per layout
- Good for production

### Batch Processing
- Score multiple layouts simultaneously
- ~50ms per layout (GPU)

## Monitoring

Add logging and metrics:
```python
import logging
logging.basicConfig(level=logging.INFO)

@app.route('/score', methods=['POST'])
def score_layout():
    start_time = time.time()
    # ... scoring logic ...
    duration = time.time() - start_time
    logging.info(f"Scored layout in {duration:.2f}s")
```

## Troubleshooting

### CUDA out of memory
Reduce batch size or use CPU:
```python
device = "cpu"  # Force CPU
```

### Slow inference
- Use GPU if available
- Batch multiple requests
- Cache model outputs

### Model not loading
- Check PyTorch installation: `python -c "import torch; print(torch.__version__)"`
- Verify transformers version: `pip show transformers`
- Try CPU-only version first

## Next Steps

1. Test the server locally
2. Integrate with Next.js API
3. Collect real layout screenshots
4. Fine-tune model on your data
5. Deploy to production

## Resources

- [CLIP Paper](https://arxiv.org/abs/2103.00020)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [PyTorch Documentation](https://pytorch.org/docs/)
