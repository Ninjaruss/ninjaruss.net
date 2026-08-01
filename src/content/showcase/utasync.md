---
title: "Utasync - Learn Japanese through Music"
publishedAt: 2026-08-01
emblem: /images/showcase/Usogui_Volume_2_popout.png
collections: ["web dev"]
---

No more stalling... the web app is now live for Utasync! (https://utasync.ninjaruss.net)

This was my first foray towards utilizing LLMs (Large language models) in an application. I absolutely hate it... not because of the potential, as I am really happy with how far I've gotten with the app. The problem was how much guess work and sheer amount of adjustments needed to get the LLM to produce a satisfactory result.

What I mean is that the amount of times I tested the auto aligner for the app on a song and still get subpar output with all these added adjustments was endless. It felt like I was hoping for the best and kept getting the same issues over and over again. This project made apparent that agentic coding is very powerful in the current time, but it often can get mislead if it misses a certain context you might have not noticed to add.

In this case, it was including some system for the app to cross-reference its findings with exact baseline scores. To auto align and check it with existing timed subtitles for a given song. I was using Claude Opus 4.8 and a bit of Fable 5, it did create the process to test songs but it lacked a holistic plan to what to do with the findings afterwards. In the latter end of the application development, the findings from each adjustment to the model were kept in context which lead to the coding agent to lay out and remember which avenues lead to regressions.

Onto the thinking of why I created this applicaiton in the first place. I wanted some way for me to practice memorizing Japanese songs as I found I was retaining vocabulary through repetition of the song and breaking down the lyrics for the Japanese word meanings to stick. COLORS by FLOW was the song I was having recent success with where I now know most of the lyrics and can remember each words meanings (ex: 存在 = being/presence, さえ = even though, 自分 = I/myself). The issue was, applications like Spotify and YouTube Music may have lyric timings, but not a way to repeat specific lyrics or a way to cross reference it with a translation.

The core idea was to make an application that could let you sync the timings of lyrics to the song. Often I would find certain songs that either did not have synced lyrics attached to the song due to it being obscure, an alternate version of the song, or the uploader did not bother having subtitles in the first place. 

Another key part was to make this able to run locally, as in letting others who use the application run the LLMs locally and not relying on a backend API to handle the workload. This approach has tradeoffs as now the application relys on the user's system to be at least somewhat modern and with decent specs to properly run the application, but on the plus side, no data is being pulled from the application (well, really to ensure I don't have to pay for any backend server costs). I really like the idea of local AI, but in practice, it often has poor results or it is way too slow to utilize. Luckily, the scope of this application isn't too large so the most it will usually take is 5-10 min to align any given song. 

