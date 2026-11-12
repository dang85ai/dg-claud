export type Session = {
  id: string;
  number: number;
  title: string;
  theme: string;
  parentSummary: string;
  skills: string[];
  askAtHome: string;
  homeChallenge: string;
  phases: Array<{
    time: string;
    title: string;
    setup?: string;
    how: string[];
    coaching?: string[];
    progressions?: string[];
  }>;
  reflection: string;
};

export const sessions: Session[] = [
  {
    id: "session-1",
    number: 1,
    title: "Dribbling & Ball Mastery",
    theme: "I can keep the ball and change direction",
    parentSummary:
      "Players build confidence carrying the ball, changing speed and direction, and keeping control while looking up.",
    skills: ["Close control", "Both feet", "Turns", "Head up", "Confidence in 1v1 moments"],
    askAtHome: "What turn helped you keep the ball today?",
    homeChallenge:
      "Set out 3 household-safe markers. Dribble around them for 5 minutes using both feet and one change-of-direction move at each marker.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: [
          "Every player grabs a ball and dribbles freely as soon as they arrive.",
          "Coach greets each player by name and keeps the environment playful."
        ]
      },
      {
        time: "5–15",
        title: "Traffic Lights",
        setup: "20x20 grid · every player has a ball",
        how: [
          "Green = dribble fast",
          "Yellow = small controlled touches",
          "Red = stop with the sole",
          "Roundabout = 360° turn"
        ],
        coaching: ["Ball close", "Head up between touches", "Use both feet"]
      },
      {
        time: "15–30",
        title: "Sharks & Minnows",
        setup: "20x20 grid · minnows with balls · 2–3 sharks without",
        how: [
          "Minnows dribble from one side to the other while protecting the ball.",
          "Sharks try to poke balls out of the grid.",
          "A player who loses the ball becomes a shark so nobody is eliminated or standing."
        ],
        progressions: [
          "Shrink the space",
          "Require a turn before crossing",
          "Challenge players to escape using their weaker foot"
        ],
        coaching: ["Change speed after the turn", "Use body to protect the ball", "Look for open space"]
      },
      {
        time: "30–42",
        title: "Gates Dribbling",
        setup: "8–10 small cone gates scattered around the grid",
        how: [
          "Players score by dribbling through as many different gates as possible.",
          "Play three short rounds and challenge players to beat their own score."
        ],
        progressions: ["Turn after every gate", "Coach becomes a moving gate blocker"],
        coaching: ["Small touches near traffic", "Bigger touch into open space", "Head up to find the next gate"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "1 GK + 4 outfield · start in a simple 1-2-1 shape",
        how: [
          "Let the game flow with minimal stoppages.",
          "Rotate positions so players experience goalkeeper, defender, midfielder and striker roles."
        ],
        coaching: ["Praise brave dribbling", "Reward decisions, not only goals", "Keep stoppages brief"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What was one thing you did well today?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What was one thing you did well today?"
  },
  {
    id: "session-2",
    number: 2,
    title: "Passing, Receiving & Support",
    theme: "I can find a teammate and move to help them",
    parentSummary:
      "Players learn to pass with purpose, receive into space, move after the pass and become an option for teammates.",
    skills: ["Inside-foot pass", "First touch", "Pass and move", "Creating space", "Communication"],
    askAtHome: "What made a pass easier for your teammate to receive?",
    homeChallenge:
      "Pass against a wall or with a family member for 5 minutes. After every pass, take two quick steps to a new angle before receiving again.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Every player starts with a ball and explores touches while teammates arrive."]
      },
      {
        time: "5–15",
        title: "Copycat Passing",
        setup: "Pairs · one ball per pair · about 5 yards apart",
        how: [
          "One player passes and the partner receives and copies the pass back.",
          "Progress to receive-and-pass with two touches.",
          "One-touch is an optional challenge only when the pair is ready."
        ],
        coaching: ["Inside of the foot", "Plant foot beside the ball", "First touch prepares the next action"]
      },
      {
        time: "15–30",
        title: "End Zone Game",
        setup: "25x20 grid · two end zones · 4v4 where numbers allow",
        how: [
          "Teams score by passing to a teammate who receives in the end zone.",
          "Players cannot dribble into the end zone to score."
        ],
        progressions: ["Receiver must move into the end zone", "Add a touch limit only if the game is flowing"],
        coaching: ["Move after you pass", "Spread out", "Show where you want the ball"]
      },
      {
        time: "30–42",
        title: "3v3 with Targets",
        setup: "20x15 grid · target player on each end line",
        how: [
          "Teams keep the ball and score by finding their target.",
          "Target rotates into the game after a successful connection."
        ],
        coaching: ["Pass and move", "Create a new angle", "Use simple communication: ‘time’, ‘turn’, ‘man on’"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Rotate positions through the 1-2-1 shape",
        how: [
          "Play mostly uninterrupted.",
          "Celebrate assists, support runs and unselfish passes as much as goals."
        ],
        coaching: ["Can you help the player on the ball?", "Find width", "Move again after passing"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What made a good pass today?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What made a good pass today?"
  },
  {
    id: "session-3",
    number: 3,
    title: "Defending & Pressing",
    theme: "I can win the ball back and stay with my player",
    parentSummary:
      "Players learn to slow attackers down, stay balanced and work together to recover the ball without diving in.",
    skills: ["Defensive stance", "Jockeying", "Delay", "Pressure & cover", "Transition after winning it"],
    askAtHome: "How did you make it harder for an attacker to get past you?",
    homeChallenge:
      "Play a 3-minute mirror game with a family member: one person moves side to side while the defender stays balanced, low and in front.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Players arrive, take a ball and begin free dribbling immediately."]
      },
      {
        time: "5–15",
        title: "Body Shape Mirror",
        setup: "Pairs · start without a ball, then add one",
        how: [
          "Attacker moves side to side and the defender mirrors.",
          "Add a ball and let the attacker dribble slowly while the defender stays in front."
        ],
        coaching: ["Side-on stance", "Stay low", "Small quick steps", "Jockey—do not dive in"]
      },
      {
        time: "15–30",
        title: "1v1 to Goal",
        setup: "Two small goals about 15 yards apart",
        how: [
          "Attacker tries to score.",
          "Defender delays, wins the ball and can immediately attack the opposite goal.",
          "Rotate roles often so players get repeated attacking and defending reps."
        ],
        coaching: ["Slow the attacker", "Guide them one way", "Win it, then play forward"]
      },
      {
        time: "30–42",
        title: "4v4 Pressing Game",
        setup: "30x20 grid · two goals",
        how: [
          "When possession changes, the nearest defender applies pressure while teammates recover and cover.",
          "Award a bonus point for a clean regain in the attacking half."
        ],
        coaching: ["Nearest player pressures", "Second player covers", "Recover together", "Communicate"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Regular 5v5 with position rotation",
        how: [
          "Allow the game to flow.",
          "Use only 2–3 quick praise stoppages to highlight strong defending or teamwork."
        ],
        coaching: ["Notice effort to recover", "Praise patience", "Celebrate winning the ball together"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What does good defending look like?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What does good defending look like?"
  },
  {
    id: "session-4",
    number: 4,
    title: "Shooting & Finishing",
    theme: "I can be brave and shoot",
    parentSummary:
      "Players learn to set the ball, strike with confidence and recognize moments when shooting is the right choice.",
    skills: ["Plant foot", "Clean strike", "Follow-through", "Quick decision", "Rebounds"],
    askAtHome: "What helped you make good contact with the ball?",
    homeChallenge:
      "Use a safe target such as two cones or shoes. Take 10 controlled shots with each foot from a short distance and focus on accuracy before power.",
    phases: [
      {
        time: "0–5",
        title: "Welcome & Free Play",
        how: ["Players arrive and dribble freely with a ball each."]
      },
      {
        time: "5–15",
        title: "Two-Channel Dribble & Shoot",
        setup: "Two active shooting channels · one ball per player · rotating goalkeepers",
        how: [
          "Players dribble through their channel and shoot, then immediately collect a ball and rejoin through open space.",
          "Both channels operate at the same time so there are no standing lines.",
          "Alternate the finishing foot when appropriate."
        ],
        coaching: ["Plant foot beside the ball", "Strike through the ball", "Follow through toward the target", "React to rebounds"]
      },
      {
        time: "15–30",
        title: "Numbers Game to Goal",
        setup: "Two teams · goals at each end · balls with coach",
        how: [
          "Coach calls 1, 2 or 3 and that many players from each team enter.",
          "The group competes for the ball and plays live to goal."
        ],
        coaching: ["Attack quickly", "Look up before shooting", "Follow rebounds", "Be brave"]
      },
      {
        time: "30–42",
        title: "Wide Play & Finishing",
        setup: "Two wide channels and a central finishing area",
        how: [
          "Wide player carries the ball into space and plays across goal.",
          "Teammates attack the central area and finish.",
          "Rotate roles frequently."
        ],
        coaching: ["Get your head up", "Play the ball into a teammate’s path", "Arrive ready to finish"]
      },
      {
        time: "42–55",
        title: "5v5 Scrimmage",
        setup: "Regular 5v5 with position rotation",
        how: [
          "Encourage players to recognize shooting opportunities anywhere in the attacking half.",
          "Keep the game flowing and praise brave attempts, including misses."
        ],
        coaching: ["Can you see the goal?", "Set and strike", "Follow your shot"]
      },
      {
        time: "55–60",
        title: "Cool-Down & Team Talk",
        how: ["Water and light movement", "Ask: “What did you do before you shot?”", "Finish with the team cheer"]
      }
    ],
    reflection: "What did you do before you shot?"
  }
];


export function trainingPlan(event: { title: string; notes?: string | null; event_type?: string }) {
  if (event.event_type && !["training", "practice"].includes(event.event_type)) return undefined;
  const text = `${event.title} ${event.notes ?? ""}`.toLowerCase();
  const explicit = text.match(/\[training: (session-[1-4])\]/);
  if (explicit) return sessions.find(plan => plan.id === explicit[1]);
  return sessions.find(plan => text.includes(plan.title.toLowerCase()));
}
