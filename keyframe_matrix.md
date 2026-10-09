# Home Scene Playback Map

The home scene uses one 10-second exploded-house video. Scroll milestones select a chapter; each chapter plays once from its start to its end, then pauses. Scrolling backward selects and plays the earlier chapter again.

| Chapter | Scroll frames | Video time | Still fallback |
| --- | ---: | ---: | --- |
| Hero | 0–45 | 0–2 seconds | Exterior house |
| Facade | 46–110 | 2–6 seconds | Annotated exploded view |
| Reinforced concrete | 111–200 | 6–10 seconds | Clean exploded view |

Video: `/brand/Exploded_view_of_house_1080p_20261009084148.mp4`

Still fallbacks load in order and crossfade over two seconds. Later stills are deferred until their chapter is reached. The animated GIF is not used.
