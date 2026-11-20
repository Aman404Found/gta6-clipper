# GTA 6 clipper
Offline Node entry for make.fun's video bounty; standard library only.

## Status
Updated 2026-11-20. Entry rewritten in the recorded session; 13 end-to-end cases pass on Node v24.19.0. VIDEO.json remains the invalid placeholder pending the owner's upload. No clip was produced: the tool permission gate blocked the installed yt-dlp download as an install and prohibited retrying. No footage was inspected. Kit check reports transcripts_present failure because the requested command supplies no transcripts. No upload or submission performed.

## Run
`MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts`
`node test-e2e.mjs`
The placeholder intentionally exits 1; valid links copy exact input bytes silently.

## Map
Kit: `../gta6-kit/gta6-clipper-01-kit`; downloader: `../tools/yt-dlp.exe`. The opening request's paths were one level too high. From the kit, `--repo ../../gta6-clipper` resolves correctly.

## Decisions
Media stays outside git. Final requested delivery remains `../gta6-clip-final.mp4`, not produced in this session. Only the owner uploads to YouTube. A valid URL test proves syntax and copying, not that a video is public.
