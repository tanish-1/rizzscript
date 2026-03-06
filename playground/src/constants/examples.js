export const EXAMPLES = {
  "Hello World": `ready to lock in

// Hello world in RizzScript 🔥
spill "Chat we coding"
spill "Welcome to RizzScript v1.0"
spill "A programming language that compiles vibes, not bugs."

vibe check

peace out`,

  "Variables": `ready to lock in

// Variables and constants in RizzScript

vibe username = "Tanish"
vibe score    = 100
vibe level    = 1

spill "Player: " + username
spill "Score:  " + str(score)
spill "Level:  " + str(level)

// Update a variable
score = score + 50
spill "New score: " + str(score)

// Constants — cannot be changed
lock in MAX_SCORE = 9999
spill "Max possible score: " + str(MAX_SCORE)

// Null / default value
vibe powerup = mid
spill "Powerup: " + str(powerup)

// Booleans
vibe is_alive = bet
vibe is_banned = cap

spill "Alive: " + str(is_alive)
spill "Banned: " + str(is_banned)

peace out`,

  "Conditionals": `ready to lock in

// Conditional logic — sus check / or nah

vibe score = 95

sus check (score == 100) {
  spill "Literally perfect — no cap bestie"
}

sus check (score >= 90) {
  spill "Main character energy detected"
} or nah {
  spill "Mid performance tbh"
}

// Nested conditions
vibe rank = "S"

sus check (rank == "S") {
  spill "S rank? Absolute rizz"
} or nah {
  sus check (rank == "A") {
    spill "A rank — still W"
  } or nah {
    spill "Keep grinding bestie"
  }
}

// Boolean operators
vibe has_pass = bet
vibe is_vip   = cap

sus check (has_pass == bet && is_vip == cap) {
  spill "Access granted (no VIP needed)"
}

sus check (has_pass == cap || is_vip == bet) {
  spill "Alternative access"
} or nah {
  spill "Main access route confirmed"
}

peace out`,

  "Loops & Grinding": `ready to lock in

// Loops in RizzScript

// For loop — "loop the vibe"
spill "--- Counting with loop the vibe ---"
loop the vibe i from 0 to 5 {
  spill i
}

// For loop with expressions
spill "--- Squares ---"
loop the vibe n from 1 to 6 {
  spill str(n) + " squared = " + str(n * n)
}

// While loop — "grind"
spill "--- Grinding XP ---"
vibe xp = 0
grind xp < 5 {
  xp = xp + 1
  spill "XP gained: " + str(xp)
}

// While loop countdown
spill "--- Countdown ---"
vibe count = 3
grind count > 0 {
  spill str(count) + "..."
  count = count - 1
}
spill "GOOOO 🔥"

peace out`,

  "Functions": `ready to lock in

// Functions in RizzScript — cook & drop

cook greet(name) {
  spill "Yo " + name + " 👋"
}

greet("Chat")
greet("Bestie")

cook factorial(n) {
  sus check (n <= 1) {
    drop 1
  }
  drop n * factorial(n - 1)
}

spill "5! = " + str(factorial(5))

peace out`,

  "Classes (Aura)": `ready to lock in

// Classes in RizzScript — aura & fresh

aura Player {
  vibe name
  vibe score = 0

  cook init(name) {
    self.name = name
  }

  cook gain_xp(amount) {
    self.score = self.score + amount
    spill self.name + " gained " + str(amount) + " XP! Total: " + str(self.score)
  }
}

vibe p1 = fresh Player("Tanish")
p1.gain_xp(50)
p1.gain_xp(40)

peace out`,

  "Async Chill": `ready to lock in

spill "Starting the vibe check..."
spill "Wait for it..."

chill(1000)
spill "Still waiting..."

chill(2000)
spill "W vibes incoming! 🔥"

peace out`
};
