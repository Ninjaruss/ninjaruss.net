---
title: "L-file - Usogui Archive"
tags: ["web dev"]
publishedAt: 2026-02-07
emblem: /images/notes/attention-01.svg
collections: ["web dev"]
---

I finally did it! The Usogui database is now live on the Internet! 
  
<a href="https://l-file.com" target="_blank" rel="noopener noreferrer">
  L-file
</a>
  
I was looking to try my hand at making a full production website while using... Claude Code. Yes, this website is immensely vibe coded, but I wanted to make sure that the priority was to make a stable enough database for my favorite manga. To me, the coolest thing is that I can get this site live with all the features I want on my own. It's better to have a site than not make one at all to me.

![Landing page for L-file.com](/images/showcase/2026-02-07-L-file-home.png)

Some quick things I learned while making this website:
- Being really specific about your site like including specifications of how the website will be used and the types of data on your site goes a long way in making the development process easier.
- I personally don't like frontend development because there are so many unintended issues that may occur while coding and can get very difficult in identifying where the issue is. TypeScript helps in avoiding this issue, but (at least while I was using it) the large language model (LLM) can identify the issue. But it requires precise detail on the issue or it will misunderstand what you want fixed.
- Without coding directly, it can become a drag having to waste context tokens on solving simple issues like component sizing and logic cases.

What really urged me to make this site was the fact there isn't a really great wiki for Usogui yet. The closest thing that exists is the Usogui fandom website, but it is largely incomplete and the user interface is horrendous and filled with ads. On top of that, this manga is largely unknown and doesn't even have an official English translation despite its amazing story that spans over 539 chapters.

The one thing that this project has made clear to me is that I really do lack a lot of frontend coding experience. Although I can understand what the code does, I have trouble customizing it to my own and really fine tuning what the user interface should look. As a result, the website's design looks very deriviative and is missing a unique feel to it. 

One of the major issues early on with coding this website was the data management for the admin dashboard. It might be due to the unfamiliarity of react-admin, but there would often be issues with editing and saving data. I think it was due to the LLM not keeping in mind the frontend/backend API connections and would not properly update them if new changes were added to the data architecture.

![Initial database design of the Usogui database](/images/showcase/2025-08-21-Database-Diagram.png)

The one model-context-protocol I added to Claude Code was Serena. To be honest, I am not sure how effective this tool is with vibe coding, but it is supposed to condense tool usage for the LLM to properly search through the project quickly. Basically, it should navigate the project a bit easier without spending too much additional context to find specific files. In the future, I plan to look into using a MCP for the frontend as Opus did an alright job in frontend implementation, but was lacking in how clean the design could be.

Overall, I sort of downplay how neat this website is after completing it. Even though it feels like a budget wiki page, it's pretty cool to see some of the additions I came up with that makes it my own. Namely, the profile images being pulled from character's entity display was inspired by old school profiles on Dueling Network and the chapter progress spoiler being from my want to show progression while using this site in tandem with reading the long manga. 

Hopefully, a frontend overhaul may be planned in the future, but the real struggle now is to get attention to this site. The ideal scenario is that it inspires others to contribute to this site and really make it a premier resource for newcomers and those that plan to reread the story. 

![Yes, this is a real panel.](/images/showcase/2026-02-07-Usogui-feet-meme.jpg)