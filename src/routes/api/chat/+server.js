import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // load .env file

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST({ request }) {
  try {
    const { messages } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || 'No reply.';

    return json({ reply });
  } catch (err) {
    console.error(err);
    return json({ error: 'Failed to contact OpenAI' }, { status: 500 });
  }
}
