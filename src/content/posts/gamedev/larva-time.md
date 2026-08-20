---
title: How a Larva Spent a Year and a Half Going from "If-Else Hell" to Data-Driven Design & Input-Pipeline
author: antp0p
pubDatetime: 2026-08-20T07:37:43+00:00
slug: larva-time
featured: true
draft: false
ogImage: "https://pub-0f75c87e0d474ead92a00ab2ff32da7b.r2.dev/post/larva-time/mise.jpg"
tags:
  - Game Dev
description: Or, the evolution of antp0p the larva
---
<img src="https://pub-0f75c87e0d474ead92a00ab2ff32da7b.r2.dev/post/larva-time/mise.jpg" alt="Mise" style="opacity: 0.9; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'" />

*The Ant Game* recently underwent its 4th major refactor. Let's take a look at how it came into existence over the course of a year and a half in the hands of a larva named antp0p...

## 0. How it all began... A winter day in early 2025

antp0p just didn't understand nodes and trees; that's all. The only thing antp0p knew was a bubble sort in Python. Movement code was copied straight from the [Official Godot 4.3 Documentation](https://docs.godotengine.org/en/4.3/index.html). After creating and instantiating bullet and player scenes, antp0p discovered the character could actually fire. Then came the step-by-step construction of the TileMap. Back then, the joy was simple.

## 1. The world of if-else: What is an architecture?

The character was moving, but the animations weren't playing correctly. For example, when firing while walking, the character would slide along with the gun held up. That's obviously wrong, so antp0p added this:

```gdscript
if Input.is_action_pressed("attack") and (Input.is_action_pressed("ui_left") 
    or Input.is_action_pressed("ui_right")):
    animated_sprite.play("attack_walk")
```

Clearly, this was incredibly hard to scale and relied heavily on specific inputs. What if antp0p wanted to add a special running animation for a low-HP state? Add another `if` statement? That obviously wasn't ideal, especially for a lazy dev like antp0p. Of course, **The If-Else** shouldn't always be criticized; for beginners, it's a handy way to learn when to do what... though, thanks to the infamous "curse of knowledge," can't quite recall exactly how it helps the learning process anymore.

Anyway, antp0p the Lazy Dev found FSMs while searching online.

## 2. The first refactor: FSMs and the Factory Pattern

This was the first real encounter with **OOP** and the concept of **state machines**. GDQuest recommended [an approach](https://www.gdquest.com/tutorial/godot/design-patterns/finite-state-machine/) where each state exists as a node under the state machine, inheriting from a base state class. antp0p followed this advice and dutifully wrote `enter()` and `exit()` methods for every derived class.

It didn't take long for antp0p to get lazy. antp0p began to wonder: *why did the state machine have to be duplicated every time a character scene was created? It was too annoying. Why couldn't it be like the `/summon` command in Minecraft, where a single line of code handles all the setup automatically?* So, antp0p made this:

```gdscript
# player.gd
func _ready() -> void:
    create_state_machine()
# state_machine.gd
func _ready() -> void:
    create_state_walk()
    create_state_airborne()
    create_state_attack()
    create_state_crouch()
    #...
# cmd.gd
func summon_player(scene: PackedScene, pos: Vector2) -> Player:
    #...
```

At the time, antp0p didn't realize this was called the **Factory Pattern**. But after finishing it, antp0p felt clever, like someone capable of "inventing" things...

## 3. Second Refactor: Architecture for Architecture's Sake

This was truly an **embarrassing** chapter. So much so that antp0p is almost too ashamed to talk about it. Let's just pick out the most stupid part.

The most stupid part: a perfectly functional StateMachine was forcibly split in two - `StateQuery` and `StateDriver`. The former was grandiosely labeled as being for *"querying states and playing animations,"* while the latter was touted as *"100% reusable, handling only state execution."* The "100% reusable" claim for StateDriver was actually true though.

Almost nothing from this decoupling-for-the-sake-of-decoupling Disasterpiece survived to the present day, with one exception: `InputDriver`, which would go on to be completely transformed in the next section.

## 4. Third Refactor: EIAAM and Data-Driven Design

<img src="https://pub-0f75c87e0d474ead92a00ab2ff32da7b.r2.dev/post/larva-time/eiaam-draft.png" alt="Draft of EIAAM" style="opacity: 0.5; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" />

**EIAAM** is a rather odd acronym. However, if you relate it to [**ECS**](https://en.wikipedia.org/wiki/Entity_component_system), you can probably guess roughly what it is tryna do.

After the awkwardness of the previous attempt, antp0p didn't want a state machine anymore. Yet, implementing ECS in Godot is extremely difficult - or rather, trying to do ECS in Godot might be more trouble than simply switching to another engine. So, antp0p began to wonder: how could one leverage Godot's unique characteristics while still enjoying the benefits of ECS?

And thus, antp0p came up with EIAAM. This was the longest of the 4 refactoring phases for *The Ant Game*, primarily because the design was scrapped and restarted multiple times along the way. The initial concept was incredibly convoluted; antp0p included it here just to see if any little ants reading this would get their brains tied in knots. 

> Every action - whether walking, attacking, or taking damage - can be abstracted as: Input-Action.

What happens when the player presses `"Walk"`:

- The InputDriver receives the `pressed` input.
- Based on the action's `duration` defined in the configuration, the `InputDriver` determines if it is a `held` action (one that persists as long as the player holds the key) or an `instant` action (one that executes for a set time after being triggered and then ends automatically). `"Walk"` is clearly a held action.
- The `InputDriver` emits a signal to the `Entity`'s `ActionHandler`. The handler matches predicates (filtering out those that don't apply), matches commands based on action categories (acceleration, max velocity, etc.), and packages the data into a command argument sent to the `ActionParser`. The `ActionParser` then matches and executes the corresponding command from `ActionLib`, and in this case, set_velocity().
- The `StateMachine` reads and updates the state. `AnimControl` updates the animation.

What happens when the player releases `"Walk"`:

- The `InputDriver` receives the `pressed=false` input (i.e., release).
- The `InputDriver` matches the action and emits a signal.
- The `ActionHandler` packages this as an "undo" command argument and sends it to the ActionParser for execution.
- The `StateMachine` reads the input, tracks timing, and updates the state. AnimControl updates the animation.


That was a massive, roundabout process! The `ActionParser` was also completely superfluous; a conclusion antp0p eventually reached as well. Also, the approach was unstable and cumbersome: the "undo" function relied merely on reversing the argument values rather than having a system to store and clear currently executing tasks. 

Consequently, a simplified version was introduced: the `ActionParser` and `ActionLib` were removed, and an inner class, `ActionTimer`, took over the timing. However, this effectively sidelined the `StateMachine` and left modifiers without a proper home. Thus, `Attribute` and its derived classes (such as `AttributeAccel` and `AttributeMaxVel`) were introduced, and the `StateMachine` was completely removed:

> Every action is abstracted as: Input-Action-Modifier.

What happens when the player presses `"Roll"` (an instant action) :
- The `InputDriver` receives the `pressed` input.
- The `InputDriver` determines the action type based on the configured `duration`.
- The `InputDriver` emits a signal to the `Entity`'s `ActionTimer`; upon receipt, predicates are matched to filter out invalid inputs, and the `ActionTimer` then tracks the action's duration and pushes a `Modifier` to the `Attribute`.
- `AnimControl` updates the animation.
- The `ActionTimer` finishes tracking time and removes the `Modifier` associated with that action key from the corresponding `Attribute` category.
- `AnimControl` updates the animation.

This design was carried over from before the 4th refactor, and it still held up well. A key application was its support for "Behavior Modifiers" - Modifiers that trigger specific behaviors rather than simply applying numerical values (such as the flash-white effect when taking a hit). Of course, state machines haven't disappeared entirely; the `ActionTimer` effectively provides state machine functionality. An `ActionBag` stores Modifiers and other metadata; it features a `next_action` field that allows for action chaining to create segmented sequences, such as wind-up, active attack, and recovery phases (they're called `preattack`, `attack`, and `postattack` in the code for fewer letters).

Even more importantly, EIAAM supports simulated input, which isn't done via `Input.parse_...()`, which could cause erratic behavior in other nodes, but through a dedicated function that generates pre-processing results identical to those of real input. This means mobs can "press keys" to control themselves just like players with a `VirtualBrain` node. The player's brain is a "real" brain; then the monster AI is naturally the "`VirtualBrain`."

antp0p was very pleased with this architecture and named it EIAAM: Entity-Input-Action-Attribute-Modifier.

## 5. Fourth Refactor: EIAAM Advanced - A True Input Pipeline

<img src="https://pub-0f75c87e0d474ead92a00ab2ff32da7b.r2.dev/post/larva-time/eiaam2-draft.png" alt="Draft of EIAAM 2" style="opacity: 0.5; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" />

If EIAAM was *so* good, why refactor it again? Naturally, because issues arose. This refactor began 4 days ago, was completed 2 days ago, and a bug was fixed just 24 hours ago. While it retains the EIAAM, many elements have been renamed and revamped.

The `InputDriver` is now called `InputPipeline` and functions as a *genuine* input pipeline. The `ActionTimer` has been renamed `ActionHandler` (reusing a name from the earlier iteration). "Behavior Modifiers" have been formally promoted to a first-class feature: `Behavior.BehaviorType`.

So, what problem did antp0p actually run into? A rather serious issue for an action game: **rolling could not interrupt the "postattack"**; no matter how the predicates were written, it simply wouldn't work. Another issue was that `next_action` behaved in a highly unstable manner; it only worked correctly if its `if` block was placed in one very *specific* spot. Moving it anywhere else, even somewhere that should theoretically make no difference, resulted in a one-frame gap. It was practically sorcery. Consequently, antp0p read some articles online and redesigned most of the system.

- An `ActionSet` system was introduced, comprising multiple `ActionAtom`s. Each `ActionAtom` has its own begin/end times, as well as specific Modifiers and Behaviors. This allows functionality previously handled by `next_action` to be implemented more stably using multiple `ActionAtom`s. 
- `ActionAtom`s now support configurable interruption windows (begin/end times) and specify which actions can interrupt them. 
- Modifiers also have their own begin/end times, allowing for finer-grained configuration. 
- Predicates were consolidated into 4 functions: real-time intent, real-time context, snapshot intent, and snapshot context. The two snapshot functions handle filtering, i.e., determining which `ActionSet` to execute when multiple sets correspond to the same input event. For example, a standard jump and a double jump share the same jump key, but the double jump requires conditions such as the coyote time being already consumed and the remaining jump count being `> 0`.
- The `InputPipeline` generates timestamped commands for inputs associated with actions, pushes them into a queue, and sorts them by priority. A filter then uses the aforementioned functions to match commands to an `ActionSet`, pushes them to the command processing queue, and re-sorts the queue by priority. The processing queue evaluates real-time predicates based on the various buffering times of the `ActionSet`s.

>[!TIP]
> `RefCounted`s are pretty useful for keeping data organized and type-safe, kinda like structs of C. In this example, antp0p used an `InputCommand` `RefCounted` to store data from an `InputEvent` along with the `timestamp`, `action_set` and other info.

At this point, everything looked perfect! Not quite though. There was another serious issue - the very bug mentioned earlier that had been fixed 24 hours ago. When multiple keys were pressed within a single frame, incompatible events would activate simultaneously - such as shooting and rolling at the same time (how could one possibly aim accurately like that?).

Debugging suggested that an action activated in the previous loop hadn't been added to the active array in time, while not entirely certain. And the direct cause was that the predicate was receiving an empty active array. The mighty print statement revealed this to antp0p. The official Godot documentation didn't explain why this ultra-niche timing issue occurred, and antp0p still doesn't know the reason. Perhaps antp0p needs to go back and study C++. Praise be to print.

antp0p's solution was to introduce a "pending" array: once the input pipeline activates an action, it is immediately added to this pending array. The predicate then evaluates a combination of the active array and the pending array, resolving the issue. To test this fix, antp0p used `Input.parse_(i forgor)` to trigger 4 different actions simultaneously within a single frame; the result was that only the "roll" action, which is with the highest priority, was triggered. A pretty solid test result.

## 6. Why write this article?

Every architecture - or anything that might not quite qualify as an architecture - has a reason for existing (except for that mess in Section 3; antp0p must have been half-asleep back then). For beginners, if-else is the most intuitive approach; there is no need to jump straight into FSMs. Action games, RPGs, and simulation games have different requirements; there is no need to build a *Monster Hunter* input pipeline for *Cookie Clicker*. Eventually antp0p found the solution that suits both antp0p the Lazy Dev and *The Ant Game* itself. Beyond the points mentioned above, the purpose of this article is also to summarize the lessons learned.

That's all for today. Thanks for reading!

<img src="https://pub-0f75c87e0d474ead92a00ab2ff32da7b.r2.dev/post/larva-time/dodo.gif" alt="Dodo" class="border-none" style="opacity: 0.8; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'"/>
