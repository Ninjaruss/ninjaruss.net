---
title: "L-file - Usogui Database"
tags: ["web dev"]
publishedAt: 2026-02-07
updatedAt: 2026-03-22
emblem: /images/showcase/Usogui_Volume_2_popout.png
collections: ["web dev"]
---

I finally did it! The Usogui database is now live on the Internet! [L-file website](https://l-file.com)

I was looking to try my hand at making a full production website while using... Claude Code. Yes, this website is immensely vibe coded, but I wanted to make sure that the priority was to make a stable enough database for my favorite manga. To me, the coolest thing is that I can get this site live with all the features I want on my own. It's better to have a site than not make one at all to me.

![Landing page for L-file.com](/images/showcase/2026-02-07-L-file-home.png)

Some quick things I learned while making this website:
- Being really specific about your site like including specifications of how the website will be used and the types of data on your site goes a long way in making the development process easier.
- I personally don't like frontend development because there are so many unintended issues that may occur while coding and can get very difficult in identifying where the issue is. TypeScript helps in avoiding this issue, but (at least while I was using it) the large language model (LLM) can identify the issue. But it requires precise detail on the issue or it will misunderstand what you want fixed.
- Without coding directly, it can become a drag having to waste context tokens on solving simple issues like component sizing and logic cases.

What really urged me to make this site was the fact there isn't a really great wiki for Usogui yet. The closest thing that exists is the Usogui fandom website, but it is largely incomplete and the user interface is horrendous and filled with ads. On top of that, this manga is largely unknown and doesn't even have an official English translation despite its amazing story that spans over 539 chapters.

The one thing that this project has made clear to me is that I really do lack a lot of frontend coding experience. Although I can understand what the code does, I have trouble customizing it to my own and really fine tuning what the user interface should look like. As a result, the website's design looks very deriviative and is missing a unique feel to it. 

One of the major issues early on with coding this website was the data management for the admin dashboard. It might be due to the unfamiliarity of react-admin, but there would often be issues with editing and saving data. I think it was due to the LLM not keeping in mind the frontend/backend API connections and would not properly update them if new changes were added to the data architecture.

![Initial database design of the Usogui database](/images/showcase/2025-08-21-Database-Diagram.png)

The one model-context-protocol I added to Claude Code was Serena. To be honest, I am not sure how effective this tool is with vibe coding, but it is supposed to condense tool usage for the LLM to properly search through the project quickly. Basically, it should navigate the project a bit easier without spending too much additional context to find specific files. In the future, I plan to look into using a MCP for the frontend as Opus did an alright job in frontend implementation, but was lacking in how clean the design could be.

Overall, I sort of downplay how neat this website is after completing it. Even though it feels like a budget wiki page, it's pretty cool to see some of the additions I came up with that makes it my own. Namely, the profile images being pulled from character's entity display was inspired by old school profiles on Dueling Network and the chapter progress spoiler being from my want to show progression while using this site in tandem with reading the long manga. 

Hopefully, a frontend overhaul may be planned in the future, but the real struggle now is to get attention to this site. The ideal scenario is that it inspires others to contribute to this site and really make it a premier resource for newcomers and those that plan to reread the story. 

![Yes, this is a real panel.](/images/showcase/2026-02-07-Usogui-feet-meme.jpg)

## EDIT 2026-03-22
So perfectionism might be grabbing me by the throat, but I spent even more time trying to clean up the website. Primarily, I was just not satisfied with the look of the initial appearance of the website. As I mentioned earlier in this post, I am no frontend developer that likes fiddling around with designs, but that isn't excuse with making a less than polished look to the site.

After some research, I decided to try out using Claude Code skills which are self contained prompts that help the LLM to be really focused in its scope. The two skills I utilized is the superpowers skill (focuses on making a proper plan and implementation task list) and the frontend design skill (focuses on making more consistent and aligned designs). I realize that I was doing what was essentially making skills earlier as I ended up feeding my ideas to a different model like Deepseek and ChatGPT to turn what I wanted into a more defined plan for Claude to execute.

![Updated home page design.](/images/showcase/2026-03-22-L-file-homepage.png)

What occurred was surprisingly cool but also frustrating to spend additional time on. The biggest surprise was while using the superpowers skill, it now asks to show you a live mockup of what it thinks you want and gives you options. I think it's a recent addition to Claude or something, but this made figuring out what I wanted so much easier. But the drawback is the amount of additional time I had to spend on making these adjustments. Namely, the token usage was significantly higher that the Claude Code Pro limits felt as strict as if I was relying on a freemium software. Not only this, there would be minor errors every now and then like the model forgetting to include the components that interacts/relies on the stuff it changed. Let's just say I spent probably additional week or two for unintended changes that would have been avoided if I was very specific and knew what I wanted.

Perhaps I need to spend more time with something like Figma or drawing as I focus more on functionality and experience rather than aesthetics. Either way, I am pleasantly surpised with what was implemented by the LLM even though I wasn't very sure on the site's look.

![Updated look to character detail](/images/showcase/2026-03-22-Character-detail.png)

Oh that reminds me, I forgot to mention that I spent some time migrating the server from using Vercel frontend and Flyio backend to using my own self funded server on Hetzner managed with Dokploy. I am absolutely amazed that something like Dokploy exists as it turns what I liked about Vercel and similar platforms into something self managed: the ease of use user interface to avoid terminal commands and config text editing. Long story short, everything about the L-file website is now contained in the Hetzner server. 

A key thing that I should note: Github Actions setup. A big issue I ran into was that whenever I pushed a change to the frontend, the server would get overloaded while trying to build the frontend. I learned that you can turn it into a Docker file that can be pre built through Github Actions so the server only needs to pull that imaged file. After a lot of trial and error, the workflow is automated so any push will rebuild the frontend image and automatically use the new one. However, there's a small issue where the server still gets occasionally overloaded when pushing changes that it fails for the last step in the Github Action flow; luckily, that step just needs to be rerun when the server is less overloaded like 5 minutes later.

![Overview of Github action workflow](/images/showcase/2026-03-22-Github-actions.png)

I still expect to make a lot of adjustments for stuff I haven't taken into account for. Even now, there's a few places that need to be polished like the detail page sub sections, but NOW the site looks like something compontent that I am happy to properly showcase now.

All there is to do is the long road of actually adding data and hoping it doesn't break! Hopefully this might inspire someone or really me to continue making stuff even if it's niche and obscure.

Remember 99% of gamblers give up before they shine, so keep on gambling!