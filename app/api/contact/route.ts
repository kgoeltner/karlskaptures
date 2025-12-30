import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, photoshootType, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !photoshootType || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Format the photoshoot type for display
    const photoshootTypeLabels: Record<string, string> = {
      'grad-individual': 'Grad - Individual',
      'grad-couple-duo': 'Grad - Couple/Duo',
      'grad-group': 'Grad - Group (3+, please inform me of the # of people)',
      'couples-engagements': 'Couples/Engagements',
      'wedding': 'Wedding',
      'portrait': 'Portrait Photoshoot (Headshots, Lifestyle)',
      'events': 'Events (Birthdays, Bridal Showers, etc.)',
      'other': 'Other',
    };

    const photoshootTypeLabel = photoshootTypeLabels[photoshootType] || photoshootType;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', // You'll need to verify your domain with Resend
      to: ['karlskaptures@gmail.com'],
      replyTo: email,
      subject: `New Contact Form Submission: ${photoshootTypeLabel}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Photoshoot Type:</strong> ${photoshootTypeLabel}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `
New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Photoshoot Type: ${photoshootTypeLabel}

Message:
${message}
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

