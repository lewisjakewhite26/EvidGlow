// ============================================================
// Mood Matrix - getAnalysis()
// 9 moods, 36 pairs, 161 total responses
// No-repeat logic via localStorage (excludes last shown index)
// ============================================================

export type MoodKey = 'happy' | 'excited' | 'calm' | 'focused' | 'creative' | 'overwhelmed' | 'worried' | 'tired' | 'lonely';

export type MoodScores = Partial<Record<MoodKey, number>>;

export interface AnalysisEntry {
  title: string;
  analysis: string;
  tip: string;
}

export interface AnalysisResult extends AnalysisEntry {
  primary: string;
  secondary: string;
  mode: "balanced" | "standard" | "mixed" | "care";
  poolSize: number;
}

// ── Content library ──────────────────────────────────────────

const BALANCED: AnalysisEntry[] = [
  {
    title: "A bit of everything today",
    analysis: "Your feelings are fairly spread out right now and nothing is really standing out above the rest. That's actually pretty normal on an ordinary day.",
    tip: "Check in with how you're feeling again later. Sometimes it takes a little while for the day's mood to settle.",
  },
  {
    title: "Pretty mixed today",
    analysis: "You're feeling a range of things at once without any one feeling standing out strongly. That's just how some days go.",
    tip: "Take things one step at a time today. There's no need to have it all figured out.",
  },
  {
    title: "All over the place a bit",
    analysis: "Your feelings are spread across the board today. Nothing too high, nothing too low. A pretty ordinary emotional day.",
    tip: "Be easy on yourself today. Not every day has a clear feeling to it and that's fine.",
  },
  {
    title: "Somewhere in the middle",
    analysis: "Nothing is really jumping out in how you're feeling today. You're somewhere in the middle of most things.",
    tip: "Sometimes the best thing to do is just get on with the day. See how you feel later.",
  },
  {
    title: "Hard to put a finger on it",
    analysis: "Your feelings are fairly balanced today without anything really standing out. That's completely fine.",
    tip: "Try checking in again at the end of the day. You might have a clearer sense of how things went.",
  },
];

const SINGLE: Record<string, { title: string; analysis: string; tips: string[] }[]> = {
  happy: [{ 
    title: "Simply happy", 
    analysis: "You're feeling a nice sense of happiness right now. It's a bright, positive headspace to be in.", 
    tips: [
      "Enjoy the feeling! You don't always need a big reason to feel good.",
      "Notice one small thing that's making you smile right now.",
      "Take this good energy into whatever you do next."
    ] 
  }],
  excited: [{ 
    title: "Feeling the buzz", 
    analysis: "You've got some great energy going on. You're looking forward to things and feeling ready for whatever's next.", 
    tips: [
      "Use this energy to do something you love. It's a great time to be active.",
      "Tell someone about what you're looking forward to.",
      "Channel this excitement into a creative project today."
    ] 
  }],
  calm: [{ 
    title: "Quietly settled", 
    analysis: "You're feeling nice and calm. Your mind is at peace and things feel steady around you.", 
    tips: [
      "Enjoy the stillness. It's a good time for a bit of quiet reflection.",
      "Take a few deep, slow breaths to really sink into this calm.",
      "Notice how your body feels when it's this relaxed."
    ] 
  }],
  focused: [{ 
    title: "In the zone", 
    analysis: "Your mind is sharp and you're ready to pay attention to what matters. You've got a good, clear focus right now.", 
    tips: [
      "Pick one thing you want to get done and go for it. Your brain is ready.",
      "Try to finish one task completely before moving to the next.",
      "This is a great time for learning something new or practicing a skill."
    ] 
  }],
  creative: [{ 
    title: "Feeling inspired", 
    analysis: "Your imagination is wide open and you're seeing things in a new way. It's a great time for ideas.", 
    tips: [
      "Don't worry about making it perfect. Just get your ideas out there.",
      "Try drawing or writing something without a plan.",
      "Look at something ordinary and try to see it in a completely new way."
    ] 
  }],
  overwhelmed: [{ 
    title: "A bit much right now", 
    analysis: "Things are feeling a little heavy and there's a lot on your mind. It's okay to feel like it's all a bit much.", 
    tips: [
      "Try to do just one small thing. You don't have to solve everything at once.",
      "Take a break from screens and noise for a few minutes.",
      "Ask someone to help you with just one task on your list."
    ] 
  }],
  worried: [{ 
    title: "Something on your mind", 
    analysis: "You're carrying a bit of worry right now. It can be hard when things feel uncertain or tricky.", 
    tips: [
      "Talk to someone you trust about what's bothering you.",
      "Write down the one thing that's worrying you most to get it out of your head.",
      "Focus on what you can control right now, even if it's just something small."
    ] 
  }],
  tired: [{ 
    title: "Running low", 
    analysis: "Your body and mind are telling you they need a break. You've been doing a lot and it's time to recharge.", 
    tips: [
      "Rest is just as important as doing things. Give yourself permission to slow down.",
      "Try to get to bed a little earlier tonight if you can.",
      "Close your eyes for five minutes and just listen to your breathing."
    ] 
  }],
  lonely: [{ 
    title: "Feeling a bit alone", 
    analysis: "You're missing a bit of connection right now. It's a very human feeling to want to be around others.", 
    tips: [
      "Reach out to a friend or family member, even just for a quick chat.",
      "Do something you enjoy that makes you feel connected to yourself.",
      "Remember that everyone feels this way sometimes—you're not alone in feeling lonely."
    ] 
  }],
};

const MATRIX: Record<string, AnalysisEntry[]> = {
  happy_excited: [
    { title: "Really good right now", analysis: "You feel happy and you've got something exciting going on too. That's a great combination, so enjoy it.", tip: "Share what's making you excited with someone you like. Good feelings are better when they're shared." },
    { title: "On a bit of a high", analysis: "Everything feels good and there's something to look forward to on top of that. Take a moment to notice how good this feels.", tip: "Tell someone about what's making you happy today. It's worth saying out loud." },
    { title: "Full of good things", analysis: "You feel bright and energised and positive all at once. Days like this don't come along all the time, so make the most of it.", tip: "Do something you've been putting off. You've got the energy for it today." },
    { title: "Really looking forward to things", analysis: "You feel genuinely happy and something exciting is ahead too. That combination of joy and anticipation is a really nice place to be.", tip: "Write down what's making you feel this way. It's good to remember what lifts you up." },
    { title: "Buzzing a bit today", analysis: "You feel upbeat and excited at the same time. Your energy is in a really good place right now.", tip: "Use this energy to start something new or finish something you've been looking forward to." },
    { title: "Everything feels good", analysis: "Happy and excited together is one of the best combinations there is. Enjoy being in this headspace while it's here.", tip: "Reach out to a friend or family member. Good moods are worth sharing." },
    { title: "A really good day", analysis: "You feel happy and there's excitement in the mix too. That's a solid foundation for a good day.", tip: "Go with whatever feels most appealing right now. Your instincts are in a good place today." },
    { title: "Feeling bright", analysis: "You feel cheerful and there's something to look forward to. That's a genuinely lovely way to start a check-in.", tip: "Let yourself enjoy this. Sometimes the best thing to do with a good mood is just be in it." },
  ],

  calm_focused: [
    { title: "Steady and clear", analysis: "You feel settled and your head is in a good place. That quiet, focused feeling is really useful and your brain is ready to do good work.", tip: "Pick something you've been meaning to get done and start it while you feel this way." },
    { title: "In a good working headspace", analysis: "You feel calm and your attention is sharp. That combination is actually quite rare and worth using.", tip: "Tackle the thing you've been putting off. You're in exactly the right state for it." },
    { title: "Quiet and switched on", analysis: "Your mind feels clear and settled at the same time. This is one of the best states for getting things done without stress.", tip: "Set yourself one clear goal for today and work toward it steadily." },
    { title: "Settled and ready", analysis: "You feel grounded and your focus is there too. Nothing is pulling you in different directions right now.", tip: "Start with whatever matters most to you today. Your head is ready for it." },
    { title: "Clear-headed today", analysis: "You feel calm inside and your thinking is sharp. That's a really productive combination to be in.", tip: "Get into whatever needs your full attention. You're well set up for it right now." },
    { title: "A good steady state", analysis: "Calm and focused together means you can work without pressure. That's actually harder to find than it sounds.", tip: "Keep going with whatever you're doing. You're in a good rhythm." },
    { title: "Focused without the stress", analysis: "You feel settled and your mind is clear. This kind of quiet focus tends to produce your best thinking.", tip: "Give your full attention to one thing. You'll be surprised how much you can do in this state." },
    { title: "Grounded and on it", analysis: "You feel stable and your concentration is there. Not every day feels this balanced, so make good use of it.", tip: "Pick something meaningful and spend proper time on it today." },
  ],

  tired_overwhelmed: [
    { title: "Running on empty", analysis: "You're dealing with too much and you don't have much left to give. That's a hard place to be and it's okay to say so.", tip: "Put something down if you can. Ask for help with something. You don't have to manage all of it alone." },
    { title: "A lot on your shoulders right now", analysis: "You're tired and there's too much going on at the same time. Those two things together make everything feel heavier than it actually is.", tip: "Just do one small thing. Not everything, just one thing. Then stop and rest." },
    { title: "Stretched a bit thin", analysis: "You've got a lot to deal with and not much energy to do it with. That's genuinely hard and it makes sense that you're feeling it.", tip: "Tell someone how you're doing. You don't have to carry this quietly." },
    { title: "Not much left in the tank", analysis: "Things are piling up and your body is tired on top of that. This is a moment to be kind to yourself, not push harder.", tip: "Rest before you try to do anything else. Everything is harder when you're running low." },
    { title: "Feeling the weight of things", analysis: "You're worn out and there's still a lot pressing on you. That combination is one of the toughest to sit with.", tip: "Scale back what you expect from yourself today. Doing less is not the same as giving up." },
    { title: "It's been a lot", analysis: "You're tired and overwhelmed at the same time. Both of those things are real and both deserve attention.", tip: "Find ten minutes to do absolutely nothing. No tasks, no screens. Just stop for a bit." },
    { title: "Could do with a rest", analysis: "There's too much happening and your body is telling you it needs a break. Listening to that is not weakness, it's just common sense.", tip: "Ask for help with one thing today. You don't have to figure it all out by yourself." },
    { title: "Everything feels like a lot", analysis: "You're overwhelmed and tired at the same time and that combination makes even small things feel big. That's completely understandable.", tip: "Write down everything that's on your mind. Getting it out of your head and onto paper makes it feel more manageable." },
  ],

  worried_overwhelmed: [
    { title: "A lot to carry right now", analysis: "You've got a lot going on and something is worrying you on top of that. That's a heavy combination and it's completely understandable if things feel hard.", tip: "You don't have to sort everything at once. Pick the smallest thing you can do and start there." },
    { title: "Your head is really full", analysis: "There's too much going on and worry is adding to it. It makes sense that you're feeling stretched.", tip: "Write down what's worrying you. Sometimes seeing it written down makes it feel less huge." },
    { title: "Carrying quite a bit", analysis: "You're overwhelmed by everything going on and worried about something on top of that. That's a hard combination to sit with.", tip: "Talk to someone you trust about how you're feeling. You don't have to hold all of this on your own." },
    { title: "A tough day inside", analysis: "Everything feels like too much and something specific is worrying you too. Both of those things are real and worth taking seriously.", tip: "Take one task off your plate if you can. Even a small reduction in pressure helps." },
    { title: "Things are feeling quite heavy", analysis: "You're worried and overwhelmed at the same time. That's an exhausting combination and it's okay to acknowledge that.", tip: "Tell a parent or someone close to you what's going on. You shouldn't have to manage this by yourself." },
    { title: "Lots weighing on you", analysis: "Your mind is full of things to deal with and something is bothering you on top of all that. It's no wonder things feel hard.", tip: "Focus on what you can actually control. Let the rest wait for now." },
    { title: "Hard to know where to start", analysis: "When you're overwhelmed and worried at the same time, everything can feel stuck. That's a normal response to too much pressure.", tip: "Pick just one small thing and do only that. Progress on anything helps when everything feels blocked." },
    { title: "A lot happening at once", analysis: "Too much going on plus something worrying you is a difficult place to be. Give yourself credit for coping with that.", tip: "Rest if you can. Everything feels more manageable after some proper downtime." },
  ],

  happy_calm: [
    { title: "Settled and content", analysis: "You feel good and there's nothing pulling you in different directions. That easy, warm feeling is worth noticing.", tip: "Do something you enjoy at your own pace today. You're in just the right headspace for it." },
    { title: "Quietly good", analysis: "You feel happy but in a calm, gentle way. Not loud or bouncy, just genuinely okay with how things are.", tip: "Notice what's made today feel this way. It helps to know what lifts you." },
    { title: "Warm and easy", analysis: "You feel happy and there's a comfortable calmness to it. That's a really solid, grounded kind of good.", tip: "Spend time doing something you genuinely like today. You've earned it." },
    { title: "In a good place", analysis: "Happy and calm together is one of the nicest combinations. Nothing is wrong and you feel it.", tip: "Share your good mood with someone around you. It has a way of spreading." },
    { title: "Feeling at ease", analysis: "You feel content and settled at the same time. There's a gentle warmth to how you're feeling today.", tip: "Enjoy the pace of today without rushing it. Not every day needs to be busy." },
    { title: "Just nice today", analysis: "You feel happy in a calm, unhurried way. That's a genuinely lovely state to be in.", tip: "Do something slow and enjoyable. Read, draw, talk to someone you like." },
  ],

  happy_focused: [
    { title: "Good and getting things done", analysis: "You feel cheerful and your head is clear. When these two line up, things tend to go well.", tip: "Get started on something that matters to you. You're well set up for it right now." },
    { title: "In a good groove", analysis: "You feel switched on and you're enjoying it. When your brain is working well and you feel good at the same time, things come naturally.", tip: "Use this time well. Get into whatever matters most to you right now." },
    { title: "Happy and sharp", analysis: "You feel great and your thinking is clear too. That's a really productive combination to be in.", tip: "Tackle something you've been putting off. You're in the right state for it." },
    { title: "Motivated and cheerful", analysis: "You feel upbeat and focused at the same time. Not a bad place to start the day from.", tip: "Start with your most important task while your energy is this good." },
    { title: "Ready and feeling good", analysis: "You feel happy and your attention is there too. That's a solid foundation for a productive day.", tip: "Don't waste this. Get into something meaningful while the feeling lasts." },
    { title: "Bright and on it", analysis: "Cheerful and focused together is one of the better combinations going. Your head is in a good place.", tip: "Set yourself a clear goal and enjoy the process of working toward it today." },
  ],

  excited_focused: [
    { title: "Ready to go", analysis: "You feel energised and your attention is pointed in one direction. You know what you want to do and you feel like doing it.", tip: "Start straight away. This kind of motivated focus doesn't always last, so use it." },
    { title: "On it", analysis: "You feel fired up and your head is sharp. That combination means you can actually make things happen today.", tip: "Jump straight into whatever you're most looking forward to. Don't overthink it." },
    { title: "Full of focus and energy", analysis: "You're excited about something and your concentration is strong to match. That's a powerful place to work from.", tip: "Set a timer and go deep into your most important task. You're well set up for it." },
    { title: "Good energy today", analysis: "You feel motivated and your thinking is clear. Use it.", tip: "Start the thing you've been looking forward to most. Right now is the right time." },
    { title: "Switched on and keen", analysis: "Your excitement and your focus are working together today. That doesn't always happen, so make the most of it.", tip: "Work on whatever excites you most. Your energy will carry you through it." },
    { title: "Energised and pointed", analysis: "You feel enthusiastic and your attention is sharp. That combination is genuinely useful and worth acting on.", tip: "Don't wait around. Get into it and see how far you can go today." },
  ],

  calm_creative: [
    { title: "Open and thoughtful", analysis: "You're in a relaxed headspace where ideas can come to you without pressure. This is one of the best states for making something.", tip: "Try something creative without worrying how it turns out. Just see where it takes you." },
    { title: "Quietly inspired", analysis: "You feel calm and your imagination is gently active. Ideas can come to you slowly and that's a good thing.", tip: "Make something today without any agenda. Let the process be the point." },
    { title: "A good creative headspace", analysis: "You feel settled and your mind is open to ideas. That combination is harder to find than it sounds.", tip: "Start a creative project you've been thinking about. The calm will help you see it through." },
    { title: "Relaxed and imaginative", analysis: "You feel at ease and your creativity is there alongside it. That's an unhurried kind of inspiration.", tip: "Draw, write, build, or make something. No deadline, no pressure. Just create." },
    { title: "Calm with ideas", analysis: "Your mind is relaxed and open at the same time. Creative ideas tend to surface more easily in this kind of headspace.", tip: "Go slowly with whatever you make today. Let the calmness guide it." },
    { title: "Easy and creative", analysis: "You feel settled and your imagination is active. That's a really pleasant state to be in.", tip: "Spend some time making something just for you today. Not for anyone else, just because you want to." },
  ],

  focused_creative: [
    { title: "Ideas with direction", analysis: "Your thinking brain and your creative brain are both switched on at the same time. That means you can actually do something with the ideas you're having.", tip: "Start on whatever project or idea has been sitting in your head. Today's a good day for it." },
    { title: "Making and thinking clearly", analysis: "You're focused enough to follow through and creative enough to come up with things worth following through on. That's a useful combination.", tip: "Work on a project that needs both ideas and effort. You've got both today." },
    { title: "A productive creative day", analysis: "Your concentration is sharp and your creativity is there alongside it. You're in a good place to make something real.", tip: "Start with the creative part while inspiration is fresh, then use your focus to refine it." },
    { title: "Sharp and imaginative", analysis: "Focused and creative together means you can take an idea somewhere. Not just think about it, actually do something with it.", tip: "Pick one idea and commit to it today. See how far your focus and creativity can take it." },
    { title: "Good thinking today", analysis: "You feel creatively open and mentally sharp at the same time. That combination is worth using.", tip: "Sit down with your most interesting project and see what you can do with it." },
    { title: "Inventive and switched on", analysis: "Your imagination is active and your focus is there to match. A good day to make something you're proud of.", tip: "Block out some time for your best project today. You're in the right headspace for it." },
  ],

  worried_tired: [
    { title: "Worn out and worried", analysis: "You're feeling anxious about something and your body is tired too. Worry is exhausting on its own, so it makes sense that you're running low on energy.", tip: "Rest if you can. Everything feels harder to manage when you're tired and the worry will be easier to deal with after some rest." },
    { title: "Heavy going today", analysis: "Something is worrying you and on top of that you're tired. Both of those things are taking something out of you.", tip: "Talk to someone about what's on your mind. You don't have to sit with it alone." },
    { title: "Your body and mind both need a break", analysis: "You're anxious about something and physically tired at the same time. That combination is draining in a way that's hard to push through.", tip: "Give yourself permission to rest before you try to deal with anything else." },
    { title: "Running a bit low", analysis: "Something is worrying you and your energy is low too. That's a tough combination because worry needs energy to work through and you don't have much to spare.", tip: "Write down what's worrying you, then rest. You'll think more clearly about it after." },
    { title: "Not your easiest day", analysis: "Tired and worried at the same time is genuinely difficult. Be patient with yourself today.", tip: "Do the minimum you need to do, then rest. The worry will still be there but you'll be better equipped to face it." },
    { title: "Could do with some support", analysis: "You're worn out and something is on your mind too. Those two things together can make you feel quite low.", tip: "Tell a parent or someone close to you how you're doing today. You don't have to manage this on your own." },
  ],

  happy_tired: [
    { title: "Had a good time", analysis: "You feel happy but your body is ready to stop. That combination usually means you've been doing something that was worth it.", tip: "Let yourself rest. The good feeling will still be there after you've had a break." },
    { title: "Good but ready for a rest", analysis: "You feel happy in yourself but your body is telling you it needs to slow down. Listen to it.", tip: "Rest properly. The happiness will carry over, but only if you look after yourself." },
    { title: "Worn out in a good way", analysis: "You feel happy and tired at the same time, which usually means you've spent your energy on something worthwhile.", tip: "Sit down, slow down, and let your body recover. You've clearly been busy." },
    { title: "Happy but running low", analysis: "You feel good but you don't have much energy left. That's a sign you've put something into your day.", tip: "Give yourself the rest you need. Pushing through tiredness when you're already happy isn't worth it." },
    { title: "Cheerful and a bit sleepy", analysis: "You feel bright and positive but your body wants to rest. Both of those things can be true.", tip: "Rest if you can. A good mood and proper rest is a great combination." },
    { title: "The good kind of tired", analysis: "You feel happy and tired together. That usually means the day has been worthwhile even if it's been full.", tip: "Wind down properly tonight. Give your body what it's asking for." },
  ],

  calm_worried: [
    { title: "Okay, but something's nagging", analysis: "You feel mostly settled, but there's something sitting quietly in the background worrying you. You're coping, but the worry is still there.", tip: "Give yourself five minutes to think the worry through properly. Sometimes that's all it needs." },
    { title: "Calm on the surface", analysis: "You feel relatively okay, but there's something underneath that's bothering you. It's worth giving that some attention.", tip: "Write down what's worrying you. Getting it out of your head can help you see it more clearly." },
    { title: "Mostly fine but not quite", analysis: "You feel settled enough, but something is nagging at you quietly. You don't have to ignore it just because you're mostly okay.", tip: "Talk to someone about what's on your mind. Even just saying it out loud can make it feel smaller." },
    { title: "A quiet worry in the background", analysis: "You feel calm overall, but there's something worrying you that won't quite go away. That's worth paying attention to.", tip: "Set aside a few minutes to think about what's bothering you and what, if anything, you can do about it." },
    { title: "Settled but thinking", analysis: "You feel calm but your mind keeps going back to something. That gentle worry is telling you something needs a bit of attention.", tip: "Don't push the worry away. Give it five minutes of proper thought, then let it rest." },
    { title: "Mostly okay", analysis: "You feel calm and that's good, but something is quietly bothering you underneath. Both things are true right now.", tip: "Share what's on your mind with someone you trust. You don't have to carry it alone." },
  ],

  excited_worried: [
    { title: "Nervous about something", analysis: "You're looking forward to something but the nerves are there too. That usually means it matters to you, which is actually a good sign.", tip: "Take a few slow breaths. Feeling nervous about something you care about is completely normal." },
    { title: "Excited and a bit anxious", analysis: "You've got something to look forward to but something is worrying you at the same time. That mix of anticipation and nerves is really common.", tip: "Focus on the thing you're excited about. The worry will likely ease once you get into it." },
    { title: "Looking forward to it but nervous", analysis: "You feel excited about something but anxious too. Those two feelings often come together when something matters.", tip: "Remind yourself of times things went better than you expected. This might be one of those times." },
    { title: "Butterflies today", analysis: "You feel excited and worried at the same time. That's a common combination before something important or new.", tip: "Talk through what's worrying you with someone. Sometimes saying it aloud takes the edge off." },
    { title: "Keen but anxious", analysis: "Something exciting is ahead but there's worry mixed into it. That tension is normal and it usually settles once you get going.", tip: "Take it one step at a time. You don't have to think about all of it at once." },
    { title: "A mix of good and nervous", analysis: "You're excited about something and worried about something at the same time. Both feelings are valid.", tip: "Write down what's worrying you separately from what you're excited about. It can help to see them as two different things." },
  ],

  focused_overwhelmed: [
    { title: "Working through it", analysis: "You're trying hard to concentrate but there's a lot pressing on you at the same time. You're doing more than you realise just to keep going.", tip: "Take a proper break, even five minutes away from it, before coming back. You'll focus better for it." },
    { title: "Pushing hard today", analysis: "You're focused but you've got a lot on your plate at the same time. That's tiring even when you're coping well.", tip: "Remind yourself you don't have to do everything today. Pick the most important thing and let the rest wait." },
    { title: "Concentrating through the pressure", analysis: "You're managing to focus even though there's a lot going on. That takes real effort and you're doing it.", tip: "Take short breaks regularly. Sustained focus under pressure is draining and breaks actually help you work better." },
    { title: "A lot on but managing", analysis: "You're staying focused despite having too much to deal with. That's harder than it looks.", tip: "Be honest with someone about how much you're carrying. Getting a bit of help now is better than burning out later." },
    { title: "Focused but feeling the squeeze", analysis: "Your concentration is there but the pressure underneath it is real. You're coping, but only just.", tip: "Cut something from your list if you can. Even one less thing to think about makes a difference." },
    { title: "Holding it together", analysis: "You're maintaining focus even though there's a lot weighing on you. That takes something out of you even when it looks fine from the outside.", tip: "Check in with yourself properly after you finish what you're doing. Don't just move straight to the next thing." },
  ],

  happy_overwhelmed: [
    { title: "Good but a lot going on", analysis: "You feel happy, but there's a lot on your plate at the same time. You're handling more than it might look like from the outside.", tip: "Pick just one thing to finish today, then properly enjoy the rest of your day without guilt." },
    { title: "Cheerful but stretched", analysis: "You feel good but there's too much going on at the same time. The happiness is real but so is the pressure.", tip: "Let yourself enjoy the good mood and deal with just one thing at a time." },
    { title: "Happy on the outside, busy inside", analysis: "You feel happy but your head is full of things to deal with. Both things are true and that's okay.", tip: "Don't let the busyness crowd out the happiness. Do one thing well and then stop." },
    { title: "Good mood, full plate", analysis: "You feel happy despite having a lot going on. That's actually a useful state to be in if you use it well.", tip: "Use your good mood to make a start on the biggest thing on your list. Happiness gives you more energy than you think." },
    { title: "Positive but under pressure", analysis: "You feel happy but the pressure of everything going on is sitting underneath it. You're juggling more than people might realise.", tip: "Talk to someone about what's on your plate. Sharing the load even a little can help." },
    { title: "Happy and a bit swamped", analysis: "You feel cheerful but there's more going on than you'd like. The happiness is a good sign, but the overwhelm needs attention too.", tip: "Write down everything you need to do, then pick the three most important ones. Ignore the rest for today." },
  ],

  calm_tired: [
    { title: "Ready to slow down", analysis: "You feel calm but your body is asking for rest. There's nothing wrong with that. It just means you've been going for a while.", tip: "Give yourself permission to do less today. Rest is part of doing well, not a break from it." },
    { title: "Gentle and a bit tired", analysis: "You feel peaceful but low on energy. Your body is asking for something slower today.", tip: "Have a proper rest without feeling like you should be doing something else." },
    { title: "Quietly tired", analysis: "You feel calm and that's good, but your body is running low. Let the calm lead you toward proper rest.", tip: "Do something gentle and restorative today. A walk, some quiet time, an early night." },
    { title: "Winding down", analysis: "You feel settled and a little sleepy. Your body is naturally asking to slow down and there's nothing wrong with that.", tip: "Listen to what your body is telling you. Rest properly when you get the chance." },
    { title: "Calm and could do with a rest", analysis: "You feel okay but your energy is low. The calmness is a good foundation but your body needs recharging.", tip: "Rest without guilt. You'll come back to things feeling better for it." },
    { title: "Peaceful but running low", analysis: "You feel settled inside but your body doesn't have much energy. That's a signal worth paying attention to.", tip: "Give yourself an easy day. Not every day needs to be full." },
  ],

  happy_creative: [
    { title: "In a making mood", analysis: "You feel good and your imagination is open. This is a really nice place to be if you want to make or create something.", tip: "Make something just for fun today. A drawing, a story, something on screen. No pressure on how it turns out." },
    { title: "Creative and happy about it", analysis: "You feel good and your ideas are flowing. That combination makes creating feel easy and enjoyable.", tip: "Start something new today. You're in exactly the right mood for it." },
    { title: "Joyful and imaginative", analysis: "You feel happy and your creativity is alive alongside it. That's a lovely combination for making things.", tip: "Make something just because you want to. Not for anyone else, just for yourself." },
  ],

  excited_creative: [
    { title: "Full of ideas", analysis: "Your mind is buzzing and you've got energy to match. There's a lot happening in your head right now.", tip: "Write or draw everything that's coming up for you. Get it all out first, then sort through it." },
    { title: "Energised and imaginative", analysis: "You feel excited and your creativity is running at full speed too. Ideas are coming quickly right now.", tip: "Grab something to write or draw with and get it all down before the momentum fades." },
    { title: "Creative energy today", analysis: "You feel excited and full of ideas at the same time. That's a productive and enjoyable state to be in.", tip: "Channel all that energy into making or creating something. Today's a good day for it." },
  ],

  focused_worried: [
    { title: "Trying to concentrate but distracted", analysis: "You want to focus but something keeps pulling your attention away. That's what worry does. It takes up space even when you're trying to use it for something else.", tip: "Write the worry down somewhere and tell yourself you'll come back to it later. Then return to what you were doing." },
    { title: "Focused but distracted inside", analysis: "You're trying to concentrate but something is pulling at your attention underneath. That's a tiring combination.", tip: "Give yourself five minutes to think about what's worrying you, then consciously set it aside and get back to work." },
    { title: "Concentrating through worry", analysis: "You're doing your best to focus but something is nagging at you. You're managing, but it's costing you more than it should.", tip: "Deal with the worry first if you can. You'll focus much better once it's out of your head." },
  ],

  creative_overwhelmed: [
    { title: "Too much in your head", analysis: "You have lots of ideas but everything is feeling like a lot right now. Too many thoughts at once can feel just as stuck as having none.", tip: "Pick just one idea and give it your full attention for a short while. Let the rest wait." },
    { title: "Creative but overloaded", analysis: "Your mind is coming up with lots of things but it's all feeling like too much. Creativity and overwhelm don't always mix well.", tip: "Write everything down to get it out of your head. Then pick one thing and focus only on that." },
    { title: "Ideas and pressure at the same time", analysis: "You're full of ideas but there's a lot of pressure sitting alongside them. It can be hard to enjoy the creativity when everything feels like a lot.", tip: "Separate your creative ideas from your to-do list. They need different kinds of attention." },
  ],

  creative_worried: [
    { title: "Imaginative but anxious", analysis: "Your mind is active and coming up with things, but some of what it's coming up with is worrying thoughts. A busy mind can go in unhelpful directions sometimes.", tip: "Try pointing your creativity at something. Draw, write, or make something. It gives your mind somewhere useful to go." },
    { title: "Creative and a bit anxious", analysis: "You've got an active imagination and right now some of that activity is worry. Giving your creativity a focus can help.", tip: "Make something today. It doesn't matter what. Turning worry energy into creative energy is a useful switch." },
    { title: "Active mind, some worry mixed in", analysis: "Your mind is busy and creative, but worry has got into the mix. That can make it hard to enjoy the creativity.", tip: "Channel what you're feeling into something you're making. Sometimes the best creative work comes from difficult feelings." },
  ],

  calm_overwhelmed: [
    { title: "Keeping it together", analysis: "You feel okay on the surface, but underneath there's a lot going on. You're managing, but it's worth giving that pressure a little attention.", tip: "Write down what's feeling like too much. Even just listing it can make things feel more manageable." },
    { title: "Calm but carrying a lot", analysis: "You feel settled in yourself but there's more going on underneath than you're letting on. That quiet coping takes energy.", tip: "Talk to someone about what's on your plate. You don't have to manage it all quietly." },
    { title: "Holding steady", analysis: "You feel calm despite having a lot going on. That's good, but make sure the calm isn't just pushing the overwhelm down rather than dealing with it.", tip: "Check in with yourself properly. Are you genuinely okay or just getting through it?" },
  ],

  tired_lonely: [
    { title: "Low and a bit on your own", analysis: "You're tired and you're also feeling a bit disconnected from the people around you. Those two things together can make everything feel a bit flat.", tip: "Don't try to do too much. Rest first, then reach out to someone you feel comfortable with." },
    { title: "Could do with some company and rest", analysis: "You're tired and feeling a bit on your own with it. Both things need attention but rest comes first.", tip: "After you've rested, reach out to someone. Even a short conversation can lift the loneliness." },
    { title: "Running low and feeling it", analysis: "You're tired and the loneliness is adding to it. Those two feelings tend to make each other worse.", tip: "Send a message to someone you like. You don't have to explain how you're feeling, just make contact." },
  ],

  overwhelmed_lonely: [
    { title: "A lot going on and feeling on your own with it", analysis: "There's too much happening and you're feeling like you're carrying it without much support. That combination is genuinely difficult.", tip: "Tell someone how you're feeling. A parent, a friend, anyone. You shouldn't have to hold all of this by yourself." },
    { title: "Too much and no one to share it with", analysis: "You're overwhelmed and feeling alone with it at the same time. That's a really hard place to be.", tip: "Reach out to someone, even just to say things are a bit much right now. You don't have to say more than that." },
    { title: "A heavy combination", analysis: "Overwhelmed and lonely together is one of the tougher combinations. You're dealing with too much and you don't feel like there's support around.", tip: "Tell a parent what's going on. That's exactly what they're there for." },
  ],

  worried_lonely: [
    { title: "Worried and feeling on your own", analysis: "Something is bothering you and you're feeling like there isn't really anyone to talk to about it. That's a tough combination.", tip: "Is there one person, anyone, you could share even a little of what's worrying you? It doesn't have to be the whole thing." },
    { title: "Anxious and a bit isolated", analysis: "You're worried about something and the loneliness is making it harder to deal with. Worry is easier to manage when you're not carrying it alone.", tip: "Send a message to someone you trust. Even just saying you're having a tough day is a start." },
    { title: "On your own with a worry", analysis: "Something is bothering you and you don't feel like there's really anyone around to talk to. That makes the worry feel bigger than it might otherwise.", tip: "Tell someone, even a small part of what's on your mind. Sharing it even a little can make a real difference." },
  ],

  happy_lonely: [
    { title: "Good, but missing someone", analysis: "You feel happy in yourself, but there's a part of you that wishes someone else was around. That's a really honest thing to notice.", tip: "Think of one person you'd like to spend time with and see if you can make that happen today or soon." },
    { title: "Happy but could do with company", analysis: "You feel good but there's a gentle sense that you'd like more people around. Good things feel better when they're shared.", tip: "Reach out to someone you like. Tell them something good that's happening for you." },
    { title: "Joyful and a bit on your own", analysis: "You feel happy but the loneliness is sitting alongside it. You'd enjoy this more with someone to share it with.", tip: "Make a plan to spend time with someone you care about. Even something small and soon." },
  ],

  focused_tired: [
    { title: "Pushing on", analysis: "Your brain wants to concentrate but your body is dragging. That takes more effort than it looks, and you're still doing it.", tip: "Have some water and a small snack. Your brain needs fuel to keep going." },
    { title: "Working hard but running low", analysis: "You're concentrating well but your energy is low underneath. That's unsustainable for long, so keep an eye on yourself.", tip: "Take a proper break before you hit a wall. Short breaks make focus last longer." },
    { title: "Focused but fading", analysis: "Your concentration is there but your body is tired. You're doing well to keep going but you won't be able to keep it up indefinitely.", tip: "Set a time limit on what you're doing. Knowing there's an end in sight helps you push through." },
  ],

  calm_lonely: [
    { title: "Quiet and a bit on your own", analysis: "You feel settled in yourself, but there's a gentle sense that you'd like more company. Sometimes quiet can tip into lonely without much warning.", tip: "Reach out to someone. Even a small connection like a quick message can shift that feeling." },
    { title: "Peaceful but a bit isolated", analysis: "You feel calm but there's a loneliness sitting alongside it. The calm is good, but the loneliness deserves some attention.", tip: "Think of one person you'd like to hear from and get in touch with them." },
    { title: "Still and a bit alone", analysis: "You feel settled inside but you're aware that you'd like more connection around you. That's worth acting on.", tip: "Make a plan to see or speak to someone you like. Even something small can help." },
  ],

  excited_calm: [
    { title: "Looking forward to something", analysis: "You're anticipating something good and you feel settled about it. Not anxious, just quietly ready. That's a really comfortable place to be.", tip: "Go ahead with whatever you're looking forward to. You're in a great headspace for it." },
    { title: "Ready and relaxed", analysis: "You've got something exciting ahead but you feel calm about it. That's a really nice balance.", tip: "Enjoy the anticipation. Not everything exciting has to be nerve-wracking." },
  ],

  excited_tired: [
    { title: "Keen but running low", analysis: "There's something you want to do, but your body isn't quite keeping up. That gap between enthusiasm and energy is a real tension.", tip: "Rest first if you can. You'll enjoy whatever you're excited about much more if you do." },
    { title: "Excited but exhausted", analysis: "You're looking forward to something but your body is tired. Try not to push through the tiredness just because you're keen.", tip: "Rest properly before you engage with whatever you're excited about. It'll be better for it." },
  ],

  excited_lonely: [
    { title: "Excited but wishing someone was there", analysis: "You've got something good going on, but you'd rather be sharing it with someone. Excitement on your own can feel a bit hollow sometimes.", tip: "Tell someone about what's exciting you. Even a quick message or short conversation can help." },
    { title: "Good things happening but feeling alone", analysis: "You feel excited but there's a loneliness to it because you don't have someone to share it with right now.", tip: "Reach out to someone and tell them what's going on. Good news is meant to be shared." },
  ],

  excited_overwhelmed: [
    { title: "A lot happening at once", analysis: "You're looking forward to something, but there's also a lot going on and it's feeling like too much to hold. That mix of excitement and pressure is genuinely tiring.", tip: "Focus on just the one thing you're most excited about. Let the rest wait for now." },
    { title: "Excited but stretched", analysis: "You've got something exciting going on but there's too much else happening alongside it. The excitement is getting a bit crowded out.", tip: "Clear some space in your day for the thing you're actually excited about. It deserves proper attention." },
  ],

  creative_tired: [
    { title: "Still thinking, but worn out", analysis: "Your mind is still coming up with things even though your body needs rest. It's fine to note your ideas down and pick them up later.", tip: "Keep a notebook nearby. Jot your ideas down before you rest so you don't lose them." },
    { title: "Ideas but no energy to act on them", analysis: "Your mind is active but your body isn't matching it. That can be frustrating but it's your body telling you something.", tip: "Write your ideas down somewhere safe and rest. They'll still be there when you've recovered." },
  ],

  creative_lonely: [
    { title: "Making things, but missing people", analysis: "You're in a creative headspace but there's a part of you that would like to share it with someone. Making things alone is good, but making things together is often better.", tip: "Think about who you could show your work to, or who you'd enjoy making something with." },
    { title: "Creative and a bit isolated", analysis: "You're in a good creative space but you'd enjoy it more with someone around. Creativity shared tends to grow.", tip: "Show someone what you're working on. Or find someone to make something with you." },
  ],

  focused_lonely: [
    { title: "Getting on with it, but missing people", analysis: "You're concentrating well, but somewhere underneath you're aware that you'd like more connection. Sometimes keeping busy is a way of not thinking about that.", tip: "After you finish what you're working on, make a plan to spend time with someone you like." },
    { title: "Busy but a bit on your own", analysis: "You're focused on what you're doing but the loneliness is there in the background. Getting things done is good, but it won't fix the feeling of missing people.", tip: "Make a plan to see or speak to someone after you're done. Give yourself something to look forward to." },
  ],

  happy_worried: [
    { title: "Good but something's on your mind", analysis: "You feel happy, but there's something in the back of your head that's bothering you a little. Both things can be true at once.", tip: "If the worry keeps coming back, try writing it down. Getting it out of your head and onto paper can really help." },
    { title: "Happy with a worry tucked away", analysis: "You feel good overall but something is quietly bothering you underneath. Don't let it sit there too long without giving it some attention.", tip: "Set aside a few minutes to think about what's worrying you. Addressing it is better than pushing it away." },
  ],
};

// ── Helper: no-repeat random picker ──────────────────────────

function pickRandom(arr: AnalysisEntry[], pairKey: string): AnalysisEntry {
  if (arr.length === 1) return arr[0];

  const storageKey = `mm_last_${pairKey}`;
  let lastIndex = -1;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) lastIndex = parseInt(stored, 10);
  } catch {
    // localStorage unavailable, fall through to plain random
  }

  const candidates = arr
    .map((_, i) => i)
    .filter((i) => i !== lastIndex);

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  try {
    localStorage.setItem(storageKey, String(chosen));
  } catch {
    // ignore
  }

  return arr[chosen];
}

// ── Helper: resolve pair key ─────────────────────────────────

function resolveKey(a: string, b: string): string | null {
  if (MATRIX[`${a}_${b}`]) return `${a}_${b}`;
  if (MATRIX[`${b}_${a}`]) return `${b}_${a}`;
  return null;
}

// ── Classification logic ──────────────────────────────────────

type Mode = "balanced" | "standard" | "mixed" | "care";

interface Classification {
  type: Mode;
  primary: string;
  secondary: string;
  key: string | null;
}

const NEGATIVE_MOODS = new Set(["overwhelmed", "worried", "tired", "lonely"]);
const POSITIVE_MOODS = new Set(["happy", "excited", "calm", "focused", "creative"]);

const BALANCED_THRESHOLD = 22;   // max spread before we call it "balanced"
const HIGH_THRESHOLD     = 68;   // minimum score to count as "high"

function classify(scores: MoodScores): Classification {
  const entries = (Object.entries(scores) as [MoodKey, number][])
    .filter(([, v]) => v !== undefined && v !== null);
  
  if (entries.length === 0) {
    return { type: "balanced", primary: "balanced", secondary: "balanced", key: null };
  }

  const values = entries.map(([, v]) => v);
  const max = Math.max(...values);
  const min = Math.min(...values);

  // If only one mood is selected, it can't be "balanced" in the traditional sense
  if (entries.length === 1) {
    const mood = entries[0][0];
    return { type: "standard", primary: mood, secondary: mood, key: null };
  }

  // ── Balanced: nothing stands out among the SELECTED moods
  if (max - min < BALANCED_THRESHOLD && entries.length > 2) {
    return { type: "balanced", primary: "balanced", secondary: "balanced", key: null };
  }

  const negHigh = entries
    .filter(([m, v]) => NEGATIVE_MOODS.has(m) && v >= HIGH_THRESHOLD)
    .sort(([, a], [, b]) => b - a)
    .map(([m]) => m);

  const posHigh = entries
    .filter(([m, v]) => POSITIVE_MOODS.has(m) && v >= HIGH_THRESHOLD)
    .sort(([, a], [, b]) => b - a)
    .map(([m]) => m);

  // ── Mixed: both a negative and a positive are genuinely high
  if (negHigh.length > 0 && posHigh.length > 0) {
    const primary   = posHigh[0];
    const secondary = negHigh[0];
    return { type: "mixed", primary, secondary, key: resolveKey(primary, secondary) };
  }

  // ── Care: negatives dominate, nothing positive is elevated
  if (negHigh.length > 0) {
    const primary   = negHigh[0];
    const secondary = negHigh[1] ?? entries
      .filter(([m]) => m !== primary)
      .sort(([, a], [, b]) => b - a)[0][0];
    return { type: "care", primary, secondary, key: resolveKey(primary, secondary) };
  }

  // ── Standard: positives lead, sort by raw score
  const sorted  = [...entries].sort(([, a], [, b]) => b - a);
  const primary   = sorted[0][0];
  const secondary = sorted[1][0];
  return { type: "standard", primary, secondary, key: resolveKey(primary, secondary) };
}

// ── Public API ────────────────────────────────────────────────

export function getAnalysis(scores: MoodScores): AnalysisResult {
  const { type, primary, secondary, key } = classify(scores);

  if (type === "balanced") {
    const entry = pickRandom(BALANCED, "balanced");
    const tipEntry = BALANCED[Math.floor(Math.random() * BALANCED.length)];
    return { ...entry, tip: tipEntry.tip, primary: "balanced", secondary: "balanced", mode: "balanced", poolSize: BALANCED.length };
  }

  // Handle single mood case
  if (primary === secondary && SINGLE[primary]) {
    const pool = SINGLE[primary];
    const entry = pickRandom(pool as any, `single_${primary}`);
    const tips = (entry as any).tips || [entry.tip];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return { ...entry, tip, primary, secondary, mode: "standard", poolSize: pool.length };
  }

  const pool = key ? MATRIX[key] : null;

  if (!pool) {
    // If no pair found, try to find any pair that includes the primary mood
    const alternateKey = Object.keys(MATRIX).find(k => k.includes(primary));
    if (alternateKey) {
      const altPool = MATRIX[alternateKey];
      const entry = pickRandom(altPool, alternateKey);
      const tipEntry = altPool[Math.floor(Math.random() * altPool.length)];
      return { ...entry, tip: tipEntry.tip, primary, secondary, mode: type, poolSize: altPool.length };
    }

    // Final fallback
    const entry = pickRandom(BALANCED, "balanced");
    return { ...entry, primary, secondary, mode: type, poolSize: BALANCED.length };
  }

  const entry = pickRandom(pool, key!);
  // Dynamic Tip Pairing: Pick a random tip from the same pool
  const tipEntry = pool[Math.floor(Math.random() * pool.length)];
  return { ...entry, tip: tipEntry.tip, primary, secondary, mode: type, poolSize: pool.length };
}
