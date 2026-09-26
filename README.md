# NormalizeArtists — moved

The artist-name rules and the tool now live in **Tikize/tikize**: `scripts/normalize-artists.mjs`.
Run `npm run normalize:artists` there to see the plan, and add `-- --apply` to rename.

Why it moved (2026-09-26): in the tikize music pool a file name is the source of the song's key
(play counts, favorites, lyric tuning). This script moved files directly, so that data stayed behind
under the old key. The tikize tool renames through the pool station and carries the data over.

The old script is in this repository's history — last version `7511059`.
