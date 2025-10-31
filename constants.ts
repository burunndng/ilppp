import { PracticesData, ModuleInfo, StarterStacksData, ModuleKey } from './types';

export const practices: PracticesData = {
    body: [
      {
        id: 'sleep',
        name: 'Sleep Foundation',
        description: 'Consistent 7-9 hours with a regular wake time.',
        why: "Sleep is the foundation for everything. It's when the brain consolidates learning, processes emotions, repairs tissue, and regulates hormones. Optimizing other practices while sleep-deprived is building on quicksand.",
        evidence: "Walker 'Why We Sleep' (2017), AASM/NSF consensus statements.",
        timePerWeek: 0,
        roi: 'EXTREME',
        difficulty: 'Medium',
        affectsSystem: ['nervous-system', 'hormones', 'cognition', 'recovery'],
        how: ['Aim for 7-9 hours nightly', 'Set a consistent WAKE time (even on weekends)', 'Keep the room dark, cool (65-68°F), and quiet', 'Avoid screens for 60-90 minutes before bed', 'Get 10 minutes of morning sunlight upon waking to set your circadian rhythm']
      },
      {
        id: 'resistance',
        name: 'Resistance Training',
        description: '2x per week, 20-30 minutes, focusing on major movement patterns.',
        why: 'Builds and maintains muscle and bone density, which are critical for metabolic health and longevity. Grip strength is a better predictor of all-cause mortality than blood pressure.',
        evidence: 'Schoenfeld et al. (2016), Westcott (2012) review, Leong (2015)',
        timePerWeek: 1,
        roi: 'VERY HIGH',
        difficulty: 'Low',
        affectsSystem: ['muscle', 'hormones', 'confidence', 'metabolism'],
        how: ['2x per week, full-body sessions', 'Focus on compound movements: Squat, Hinge, Push, Pull', 'Perform 1-2 sets per exercise to near-failure (last 1-2 reps are very hard)', 'Progress by adding weight or reps over time'],
        customizationQuestion: 'What equipment do you have access to (e.g., bodyweight only, dumbbells, full gym)?'
      },
      {
        id: 'zone2-cardio',
        name: 'Zone 2 Cardio',
        description: '3-4x per week, 30-45 min at a conversational pace.',
        why: 'Builds your aerobic base and improves mitochondrial health, which is foundational for energy and longevity. Your VO2 max is one of the strongest predictors of all-cause mortality.',
        evidence: 'Mandsager et al. (2018) JAMA, San-Millán research on Zone 2.',
        timePerWeek: 2,
        roi: 'HIGH',
        difficulty: 'Low',
        affectsSystem: ['cardiovascular', 'mitochondria', 'nervous-system', 'longevity'],
        how: ['Maintain a pace where you can speak in full sentences but not sing', '3-4 sessions of 30-45 minutes each week', 'Any modality works: brisk walking, jogging, cycling, swimming, rowing', 'This should feel sustainable, not exhausting']
      },
      {
        id: 'nutrition',
        name: 'Nutrition Foundation',
        description: 'Hit daily protein target (1.6g/kg), prioritize whole foods & fiber.',
        why: 'Provides the building blocks for recovery, satiety, and energy. Hitting protein targets is the highest-leverage nutritional change for muscle maintenance and body composition.',
        evidence: 'Morton et al. (2018) meta-analysis on protein.',
        timePerWeek: 0,
        roi: 'VERY HIGH',
        difficulty: 'Medium',
        affectsSystem: ['energy', 'mood', 'recovery', 'body-composition'],
        how: ['Calculate target: your weight in kg x 1.6 = daily grams of protein', 'Aim for 25-40g of protein per meal', 'Add 1-2 fistfuls of vegetables to lunch and dinner', 'Prioritize whole, minimally-processed foods']
      },
      {
        id: 'mobility',
        name: 'Mobility & Stretching',
        description: '5-10 min daily targeting personal restrictions.',
        why: 'Prevents injury, maintains functional range of motion, and counteracts the effects of prolonged sitting.',
        evidence: 'Thomas et al. (2018). Joint-specific mobility matters more than general flexibility.',
        timePerWeek: 1,
        roi: 'HIGH',
        difficulty: 'Very Low',
        affectsSystem: ['flexibility', 'injury-prevention', 'joint-health'],
        how: ['Identify your tightest areas (e.g., hips, shoulders, ankles)', 'Spend 5-10 minutes daily on those specific joints', 'Can be done after a workout or as a separate session', 'Dynamic movements before workouts, static holds after']
      },
      {
        id: 'cold-exposure',
        name: 'Cold Exposure',
        description: 'End your shower with 30-60 seconds of cold water.',
        why: 'Increases dopamine for hours, improving mood and focus. Builds mental resilience by voluntarily exposing yourself to discomfort.',
        evidence: 'Søberg et al. (2021)',
        timePerWeek: 0.1,
        roi: 'HIGH',
        difficulty: 'Medium',
        affectsSystem: ['mood', 'focus', 'resilience', 'dopamine'],
        how: ['Finish your normal shower', 'Turn the water to the coldest tolerable setting', 'Stay under for 30-60 seconds', 'Focus on slow, steady exhales to calm your nervous system']
      },
    ],
    mind: [
      {
        id: 'deep-learning',
        name: 'Deep Learning & Focused Reading',
        description: '30-60 min daily deliberate learning with retrieval.',
        why: 'Protects cognitive health and builds mastery. Active engagement with challenging material drives growth, while passive consumption does not.',
        evidence: 'Newport "Deep Work", Roediger & Karpicke (2006) on retrieval practice.',
        timePerWeek: 3.5,
        roi: 'VERY HIGH',
        difficulty: 'Low-Medium',
        affectsSystem: ['cognition', 'memory', 'meaning', 'focus'],
        how: ['Choose challenging material at the edge of your ability', 'Set a timer for 30-60 minutes of uninterrupted focus (no phone/distractions)', 'After the session, close the source and write down everything you can remember (active recall)', 'Focus on one topic for depth over breadth'],
        customizationQuestion: 'What topic are you most excited to learn about right now?'
      },
      {
        id: 'attention-training',
        name: 'Attention Training',
        description: '15-20 min single-task on a hard problem.',
        why: 'Attention is a trainable skill. Training your ability to sustain focus on a single, hard problem transfers to all other cognitive tasks.',
        evidence: 'Posner & Rothbart (2007), Green & Bavelier (2012)',
        timePerWeek: 2,
        roi: 'HIGH',
        difficulty: 'High',
        affectsSystem: ['focus', 'cognition', 'problem-solving'],
        how: ['Choose one hard problem or task', 'Set a timer for 15-20 minutes of true single-tasking (no tab switching, no distractions)', 'When you get stuck, resist the urge to switch tasks. Stay with the problem.', 'Do this 2-3 times per week minimum']
      },
      {
        id: 'expressive-writing',
        name: 'Expressive Writing',
        description: '15-20 min writing about emotional events for clarity.',
        why: 'Improves health, emotional processing, and working memory by translating difficult experiences into a coherent narrative.',
        evidence: 'Pennebaker & Smyth (2016)',
        timePerWeek: 1,
        roi: 'HIGH',
        difficulty: 'Low-Medium',
        affectsSystem: ['emotional-regulation', 'cognition', 'stress-reduction'],
        how: ['Choose a difficult experience or emotional event', 'Write continuously for 15-20 minutes without editing', 'Focus on your deepest thoughts and feelings', 'Do this for 3-4 consecutive days on the same topic for maximum benefit', 'Keep it completely private to ensure honesty']
      },
      {
        id: 'aqal-awareness',
        name: 'AQAL Awareness Practice',
        description: '1-5 min practice to feel the I, We, and It dimensions of experience.',
        why: 'The AQAL framework is a "psychoactive" map. Regularly feeling into its dimensions makes you more aware of the facets of reality, leading to a more comprehensive perspective and more effective action.',
        evidence: 'Integral Theory (Ken Wilber). The practice is a form of metacognitive awareness training.',
        timePerWeek: 0.2,
        roi: 'HIGH',
        difficulty: 'Very Low',
        affectsSystem: ['perspective', 'awareness', 'metacognition'],
        how: [
          'Feel your "I-space": your individual awareness, thoughts, and feelings right now.',
          'Feel your "We-space": your connection to others, shared understanding, and relationships (even imagined).',
          'Feel your "It-space": the objective world around you, physical sensations, the ground beneath you.',
          'Silently remind yourself: "These are all dimensions of my being, all of which I will include."',
        ]
      },
      {
        id: 'perspective-taking',
        name: 'Perspective Taking',
        description: 'Deliberately try to adopt the viewpoint of another person or group.',
        why: 'Develops cognitive, moral, and interpersonal lines of development. Reduces egocentrism and allows for more compassionate and effective solutions to complex problems.',
        evidence: "Robert Kegan's stages of adult development, developmental psychology research.",
        timePerWeek: 0.5,
        roi: 'VERY HIGH',
        difficulty: 'Medium',
        affectsSystem: ['cognition', 'empathy', 'moral-development', 'interpersonal'],
        how: [
          'Choose a person or group you disagree with or don\'t understand.',
          'For 5-10 minutes, try to genuinely articulate their point of view in the first person ("I believe... because...").',
          'What do they see that you don\'t? What do they value? What is their truth?',
          'The goal is not to agree, but to be able to accurately represent their perspective.'
        ]
      },
      {
        id: 'belief-examination',
        name: 'Examining Core Beliefs',
        description: 'Monthly deep dive into 1-2 limiting beliefs.',
        why: 'Beliefs run your life unconsciously. Examining them allows you to gain agency and choose more empowering narratives.',
        evidence: 'Foundations of Cognitive Behavioral Therapy (CBT), Beck & Clark (1997).',
        timePerWeek: 0.5,
        roi: 'VERY HIGH',
        difficulty: 'Medium-High',
        affectsSystem: ['identity', 'cognition', 'behavior', 'emotional-regulation'],
        how: [
          'Choose one limiting belief (e.g., "I\'m not good enough," "I always fail").',
          'Find evidence for and against this belief. What are the facts?',
          'When did you first start believing this? What was the context?',
          'What has this belief cost you? How has it limited your actions and feelings?',
          'What is a more true, more empowering belief you could choose instead?',
          'Focus on just 1-2 core beliefs per month for deep work.'
        ]
      }
    ],
    spirit: [
      {
        id: 'meditation',
        name: 'Daily Meditation',
        description: '5-15 min daily practice of focused attention.',
        why: 'The core training for your mind. Builds capacity for attention, emotional regulation, and equanimity. Consistency matters more than duration.',
        evidence: 'Hölzel et al. (2011) neuroimaging, Goyal et al. (2014) JAMA meta-analysis.',
        timePerWeek: 1.2,
        roi: 'EXTREME',
        difficulty: 'Low-Medium',
        affectsSystem: ['nervous-system', 'attention', 'anxiety', 'focus'],
        how: ['Start with 5-10 minutes daily. Consistency is key.', 'Sit comfortably upright.', 'Focus on the sensation of your breath.', 'When your mind wanders (it will), gently return your attention to the breath. This return is the practice.'],
        customizationQuestion: 'What is your biggest challenge when you try to meditate (e.g., busy mind, falling asleep, finding time)?'
      },
      {
        id: 'gratitude',
        name: 'Gratitude Practice',
        description: '5 min daily - name three specific good things.',
        why: 'Exceptional ROI for time invested. Rewires attention toward the positive, boosts wellbeing, and strengthens relationships.',
        evidence: 'Emmons & McCullough (2003), Seligman et al. (2005)',
        timePerWeek: 0.5,
        roi: 'EXTREME',
        difficulty: 'Trivial',
        affectsSystem: ['mood', 'relationships', 'wellbeing'],
        how: ['Each day, write down 3-5 specific good things that happened.', "Be specific: 'The warm sun on my face during my walk' instead of 'The weather.'", 'For a bonus, write down WHY it happened (attribution).']
      },
      {
        id: 'nature',
        name: 'Nature Exposure',
        description: '120 minutes per week spent in a natural setting.',
        why: 'Reduces stress, restores attention, improves mood, and connects you to something larger than yourself.',
        evidence: 'White et al. (2019), Shinrin-yoku (forest bathing) research.',
        timePerWeek: 2,
        roi: 'HIGH',
        difficulty: 'Very Low',
        affectsSystem: ['nervous-system', 'awe', 'perspective', 'stress-reduction'],
        how: ['Accumulate 120 minutes total per week (e.g., 20 mins daily).', 'City parks, forests, and beaches all count.', 'Can be combined with Zone 2 cardio (e.g., a brisk walk in a park).', 'Intentionally notice your surroundings - sights, sounds, smells.']
      },
      {
        id: 'loving-kindness',
        name: 'Loving-Kindness Meditation',
        description: '5-10 min practice to cultivate compassion for self and others.',
        why: 'Directly counteracts the inner critic, isolation, and cynicism. Increases positive emotions and feelings of social connection.',
        evidence: 'Fredrickson et al. (2008), Kok et al. (2013)',
        timePerWeek: 0.6,
        roi: 'HIGH',
        difficulty: 'Low-Medium',
        affectsSystem: ['compassion', 'connection', 'nervous-system', 'self-criticism'],
        how: ["Start with yourself, silently repeating phrases like: 'May I be safe, peaceful, healthy, and live with ease.'", "Extend these wishes to a loved one, a neutral person, a difficult person, and finally all beings.", "Focus on the feeling of warmth and goodwill, not just the words."]
      },
      {
        id: 'integral-inquiry',
        name: 'Integral Inquiry',
        description: 'A 3-stage practice blending meditation and inquiry to deepen awareness of self and reality.',
        why: "To bring awareness to what is actually taking place, return attention to pure presence, and open into formless awareness. It helps clarify what's really going on, fostering a more comprehensive perspective and freeing attention/energy.",
        evidence: "Integral Theory (Ken Wilber). Combines elements of Gestalt therapy and Jungian psychology (via 3-2-1 Process).",
        timePerWeek: 1.5, // 20 minutes, 4-5x/week for advanced
        roi: 'VERY HIGH',
        difficulty: 'Medium-High',
        affectsSystem: ['awareness', 'cognition', 'presence', 'self-liberation', 'perspective', 'attention'],
        how: [
          'Stage 1: Becoming Grounded in Pure Presence',
          'Sit upright, breathe naturally. Count breaths (1-10), returning to 1 if distracted.',
          'Notice still points between breaths, releasing attention to openness.',
          'After 5 min stability, follow breath without counting. When mind contracts, inquire with "Avoiding?", "Contracting?", "Who am I?" and return to present awareness.',
          'Stage 2: Bringing AQAL to Bear on Your Inquiry',
          'Notice patterns of distraction (often shadow issues). Use 1-minute 3-2-1 if a person/situation arises.',
          'Use AQAL (I, We, It, lines of development, 3 bodies) to pinpoint where the disturbance is arising in your awareness.',
          'Return to pure presence after making a mental note or doing a 1-Minute Module.',
          'Stage 3: Practicing Integral Inquiry In Your Everyday Life',
          'Apply inquiry in any moment of life, not just formal meditation.',
          'Bring free Integral consciousness more fully into your waking state and eventually dream/deep sleep states.'
        ]
      },
      {
        id: 'big-mind-process',
        name: 'Big Mind Process™',
        description: 'A dialogue process to identify, understand, and integrate inner voices, leading to an experience of Big Mind, Big Heart, and the Integrated Self.',
        why: 'To allow dualistic voices to fulfill their function without suppression, leading to wisdom, compassion, and the ability to maintain these states in daily life.',
        evidence: 'Developed by Zen Master Genpo Roshi, integrating Zen teaching and Western therapeutic techniques (Voice Dialogue).',
        timePerWeek: 1.5, // 20 minutes, 4-5x/week for advanced
        roi: 'VERY HIGH',
        difficulty: 'Medium-High',
        affectsSystem: ['self-awareness', 'integration', 'emotional-regulation', 'wisdom', 'compassion'],
        how: [
          'Sit or stand quietly. Notice the qualities and contents of mind and emotions; allow them to settle.',
          'Silently use your own Facilitator voice to ask to speak to the Controller.',
          'When the Controller shows up, acknowledge its presence and qualities.',
          'If other voices need to be heard, allow them to show up, acknowledge them, and be with them until ready to move on.',
          'Now ask to speak to the voice of Integrated Big Mind/Big Heart. Allow it to manifest.',
          'Sit quietly with its qualities. You may ask questions of this voice, such as: "How big are you?" or "What do you care about?"',
          'Dwell quietly in Integrated Big Mind/Big Heart for a minute or two.',
          'Conclude by asking to speak to the voice of the Integrated Free-Functioning Human Being.'
        ]
      },
      {
        id: '123-god',
        name: 'The 1-2-3 of God',
        description: 'A meditation to experience the Ultimate (Spirit) through 1st-person ("I"), 2nd-person ("Thou"), and 3rd-person ("It") perspectives.',
        why: 'To resonate in relationship with the Ultimate from various perspectives, deepening spiritual connection and understanding.',
        evidence: 'Based on Integral Theory concepts of spiritual development.',
        timePerWeek: 1.2, // 20 minutes, 3-4x/week for advanced, similar to daily meditation
        roi: 'HIGH',
        difficulty: 'Medium',
        affectsSystem: ['spiritual-connection', 'perspective', 'awe', 'transcendence', 'meaning'],
        how: [
          'At any moment, you can experience God as a 3rd-person "It," a 2nd-person "Thou," or a 1st-person "I."',
          'Quietly repeat these sentences to yourself, letting each perspective arise:',
          '3rd-person: "I contemplate God as all that is arising—the Great Perfection of this and every moment."',
          '2nd-person: "I behold and commune with God as an infinite Thou, who bestows all blessings and complete forgiveness on me, and before whom I offer infinite gratitude and devotion."',
          '1st-person: "I rest in God as my own Witness and primordial Self, the Big Mind that is one with all, and in this ever-present, easy, and natural state, I go on about my day."',
          'Anchor relationships to the Ultimate (Spirit) in your body, mind, and feeling using a word or short phrase.',
          'Attend to the breath. When your mind wanders, utter one of the words/phrases with full feeling-awareness, returning to the present.'
        ]
      }
    ],
    shadow: [
      {
        id: 'three-two-one',
        name: '3-2-1 Process',
        description: '15-20 min journaling process when triggered.',
        why: 'A core ILP practice to make the unconscious visible and integrate projections. What irritates or fascinates you in others is often a disowned part of yourself.',
        evidence: 'Based on Gestalt therapy (Greenberg & Malcolm, 2002) and Jungian psychology.',
        timePerWeek: 0.5,
        roi: 'VERY HIGH',
        difficulty: 'Medium',
        affectsSystem: ['awareness', 'reactivity', 'compassion', 'integration'],
        how: ['1. Face It (3rd Person): Describe the person/quality that triggers you in detail.', '2. Talk to It (2nd Person): Write a dialogue with that quality. Ask it what it wants.', '3. Be It (1st Person): Embody the quality. Write from its perspective. "I am [quality]..."', 'This process works for both negative triggers (dark shadow) and intense admiration (golden shadow).'],
        customizationQuestion: 'Think of a recent minor trigger (a person or situation that annoyed you). In one or two words, what was the quality that bothered you?'
      },
      {
        id: 'shadow-journaling',
        name: 'Shadow Journaling',
        description: '10-15 min, 2-3x per week, using specific prompts.',
        why: 'Externalizes internal conflicts and puts shadow traits on paper to be examined with curiosity rather than judgment.',
        evidence: 'Pennebaker & Smyth (2016) on expressive writing.',
        timePerWeek: 0.5,
        roi: 'HIGH',
        difficulty: 'Low',
        affectsSystem: ['awareness', 'integration', 'self-knowledge'],
        how: ['Use prompts like: "What part of myself do I dislike or hide?" or "What feedback do I consistently ignore?"', 'Free write for 10-15 min without filtering or editing.', 'Keep it private to ensure complete honesty.']
      },
      {
        id: 'self-compassion',
        name: 'Self-Compassion Break',
        description: 'A 3-minute practice to respond to self-criticism with kindness.',
        why: 'Directly addresses the inner critic and shame, which are common shadow manifestations. Builds resilience and emotional wellbeing.',
        evidence: 'Neff & Germer (2013), MacBeth & Gumley (2012) meta-analysis.',
        timePerWeek: 0.25,
        roi: 'VERY HIGH',
        difficulty: 'Low-Medium',
        affectsSystem: ['self-criticism', 'shame', 'resilience', 'emotional-regulation'],
        how: ["When you notice self-criticism, pause and place a hand on your heart.", "1. Acknowledge suffering: 'This is a moment of suffering.'", "2. Common humanity: 'Suffering is part of life. Others feel this way.'", "3. Self-kindness: 'May I be kind to myself in this moment.'"]
      },
      {
        id: 'parts-dialogue',
        name: 'Parts Dialogue (IFS)',
        description: '20-30 min journaling to understand internal conflicts.',
        why: 'Resolves internal conflicts by understanding the positive intent behind different "parts" of you (e.g., the inner critic, the people-pleaser).',
        evidence: 'Emerging evidence base for Internal Family Systems (IFS).',
        timePerWeek: 0.4,
        roi: 'VERY HIGH',
        difficulty: 'Medium-High',
        affectsSystem: ['internal-conflict', 'integration', 'self-compassion'],
        how: ['1. Identify a part that is active (e.g., "the part of me that is anxious").', "2. Get curious, not judgmental. Ask it: 'What are you trying to do for me?'", "3. Listen for its fears and its protective intention.", "4. Acknowledge and appreciate its effort, even if its strategy is unhelpful."]
      },
    ]
  };
  
  export const starterStacks: StarterStacksData = {
    spark: {
      name: '✨ Spark Stack (Foundation)',
      description: 'The absolute basics for establishing stability and quick wins.',
      practices: ['sleep', 'gratitude'],
      difficulty: 'Very Easy to start',
      why: 'Focuses on the non-negotiable bedrock of sleep and the fastest way to boost mood with gratitude. Builds initial confidence and trust in the system.'
    },
    green: {
      name: '🟢 Green - Core Physical',
      description: 'Builds a strong physical foundation for energy and resilience.',
      practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio'],
      difficulty: 'Easy to maintain',
      why: 'Establishes foundational physical practices that are high ROI and can be started with low difficulty. Sets you up for consistent progress in other areas.'
    },
    yellow: {
      name: '🟡 Yellow - Mindful Spirit',
      description: 'Expands your practice to include mental focus and deeper presence.',
      practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning'],
      difficulty: 'Medium commitment',
      why: 'Broadens your ILP beyond the physical, cultivating mental clarity through deep learning and emotional regulation through daily meditation.'
    },
    orange: {
      name: '🟠 Orange - Shadow Explorer',
      description: 'Begins the crucial work of integrating unconscious patterns and inner conflicts.',
      practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'self-compassion', 'three-two-one'],
      difficulty: 'Medium-High commitment',
      why: 'Introduces direct shadow work to help resolve internal conflicts, understand disowned parts, and build resilience through self-kindness.'
    },
    red: {
      name: '🔴 Red - Integral Catalyst',
      description: 'A comprehensive stack for advanced integration and transformative inner work.',
      practices: ['sleep', 'gratitude', 'resistance', 'zone2-cardio', 'meditation', 'deep-learning', 'self-compassion', 'three-two-one', 'parts-dialogue', 'integral-inquiry'],
      difficulty: 'High commitment for deep transformation',
      why: 'For the dedicated practitioner, this stack integrates advanced self-exploration techniques including AI-guided IFS dialogue and profound spiritual inquiry.'
    }
  };
  
  export const modules: Record<ModuleKey, ModuleInfo> = {
    body: { name: 'Body', color: 'bg-green-900', textColor: 'text-green-200', borderColor: 'border-green-700', lightBg: 'bg-green-950' },
    mind: { name: 'Mind', color: 'bg-blue-900', textColor: 'text-blue-200', borderColor: 'border-blue-700', lightBg: 'bg-blue-950' },
    spirit: { name: 'Spirit', color: 'bg-purple-900', textColor: 'text-purple-200', borderColor: 'border-purple-700', lightBg: 'bg-purple-950' },
    shadow: { name: 'Shadow', color: 'bg-amber-900', textColor: 'text-amber-200', borderColor: 'border-amber-700', lightBg: 'bg-amber-950' }
  };