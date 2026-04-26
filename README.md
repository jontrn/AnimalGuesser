# AnimalGuesser

https://animalguesser.vercel.app/

AnimalGuesser is a guessing game where you try to figure out a hidden animal using AI-generated hints.

Each round picks a random animal and gives you hints one at a time. You guess until you get it right or give up.

## What it does

- Picks a random animal each round (avoids repeating recent ones)
- Uses Groq to generate hints about the animal
- Tracks guesses, hints, and results for each round
- Lets users sign in and saves their game history
- Stores user settings like theme and text size

## Tech

- Next.js (App Router)
- React
- TypeScript
- Supabase (auth + database)
- Groq API

## How it works

- Backend picks an animal and generates hints using the LLM
- User submits guesses until correct or they give up
- Everything from the round gets saved to the database

## Link

https://animalguesser.vercel.app/
