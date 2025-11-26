import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail, getUserWithCounts } from '@/lib/auth';
import { calculateAgeCategory, validateDateOfBirth } from '@/lib/parental-controls';

export async function POST(request: NextRequest) {
  try {
    const { name, username, email, password, dateOfBirth, guardianEmail } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'Name, username, email, and password are required' }, { status: 400 });
    }

    // Validate date of birth if provided
    let ageCategory = 'adult';
    if (dateOfBirth) {
      const dobValidation = validateDateOfBirth(dateOfBirth);
      if (!dobValidation.valid) {
        return NextResponse.json({ error: dobValidation.error }, { status: 400 });
      }

      ageCategory = calculateAgeCategory(dateOfBirth);

      // Reject under-13 users
      if (ageCategory === 'under_13') {
        return NextResponse.json(
          { error: 'You must be at least 13 years old to create an account' },
          { status: 403 }
        );
      }

      // Require guardian email for minors
      if (ageCategory === 'minor' && !guardianEmail) {
        return NextResponse.json(
          { error: 'Guardian email is required for users under 18' },
          { status: 400 }
        );
      }
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Create new user with age information
    const newUser = await createUser(name, username, email, password, dateOfBirth, ageCategory, guardianEmail);

    // Get user data with follower counts (will be 0 for new user)
    const userWithCounts = await getUserWithCounts(newUser.id);
    if (!userWithCounts) {
      return NextResponse.json({ error: 'Failed to retrieve user data' }, { status: 500 });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = userWithCounts;

    return NextResponse.json({
      message: 'Account created successfully',
      user: userWithoutPassword,
      requiresPinSetup: ageCategory === 'minor',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}