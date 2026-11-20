# gta6-clipper-01

Entry for make.fun's bounty "Clip GTA 6 for the most YouTube views"
(https://make.fun/bounty/gta6-clipper-01).

The entry is the video: a vertical clip cut from Rockstar's Grand Theft Auto VI
launch trailer, ending on a make.fun pitch. `VIDEO.json` names it, and the house
reads its views through the YouTube Data API; places go by views, the 20 most
watched sharing $500.

`main.ts` copies `VIDEO.json` from the repository root to `/output/VIDEO.json`,
which is where the grader reads it. Node 22, standard library only, no network.

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed.
