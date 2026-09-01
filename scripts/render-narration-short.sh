#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
voice_dir="$project_dir/work/narration-short"
render_dir="$project_dir/work/render"
asset_dir="$project_dir/assets/video"
video_file="$asset_dir/agentic-travel-commerce-concept-45s.mp4"
narration_file="$render_dir/narration-45s.m4a"
final_file="$render_dir/agentic-travel-commerce-concept-45s-with-audio.mp4"
voice_name="${VOICE_NAME:-Kyoko}"
voice_rate="${VOICE_RATE:-245}"

mkdir -p "$voice_dir" "$render_dir" "$asset_dir"

say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/01.aiff" "旅行は、決めた後が長い。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/02.aiff" "AIに渡すのは、目的と上限を決めた財布。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/03.aiff" "あとは、普段の言葉で依頼します。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/04.aiff" "AIが、予算と条件に合う旅程を組み立てる。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/05.aiff" "条件内なら、ステーブルコインで予約まで完了。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/06.aiff" "判断が必要な取引だけ、人間に戻す。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/07.aiff" "価格が変われば、勝手に進めず停止する。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/08.aiff" "権限と判断は、すべて追跡できる。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/09.aiff" "AIの判断を、安全な経済へ。"

ffmpeg -y \
  -i "$voice_dir/01.aiff" -i "$voice_dir/02.aiff" -i "$voice_dir/03.aiff" \
  -i "$voice_dir/04.aiff" -i "$voice_dir/05.aiff" -i "$voice_dir/06.aiff" \
  -i "$voice_dir/07.aiff" -i "$voice_dir/08.aiff" -i "$voice_dir/09.aiff" \
  -filter_complex "[0:a]adelay=400:all=1[a0];[1:a]adelay=3300:all=1[a1];[2:a]adelay=8700:all=1[a2];[3:a]adelay=13700:all=1[a3];[4:a]adelay=22200:all=1[a4];[5:a]adelay=28700:all=1[a5];[6:a]adelay=34700:all=1[a6];[7:a]adelay=40100:all=1[a7];[8:a]adelay=42800:all=1[a8];[a0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:duration=longest:dropout_transition=0,apad=pad_dur=45,atrim=duration=45,loudnorm=I=-18:TP=-2:LRA=9[out]" \
  -map "[out]" -c:a aac -b:a 160k "$narration_file"

ffmpeg -y -i "$video_file" -i "$narration_file" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest -movflags +faststart "$final_file"

mv "$final_file" "$video_file"
printf 'Short narrated video: %s\n' "$video_file"
