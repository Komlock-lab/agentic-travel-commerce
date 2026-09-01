#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
voice_dir="$project_dir/work/narration"
render_dir="$project_dir/work/render"
asset_dir="$project_dir/assets/video"
video_file="$asset_dir/agentic-travel-commerce-concept.mp4"
narration_file="$render_dir/narration.m4a"
final_file="$render_dir/agentic-travel-commerce-concept-with-audio.mp4"
voice_name="${VOICE_NAME:-Kyoko}"
voice_rate="${VOICE_RATE:-220}"

mkdir -p "$voice_dir" "$render_dir" "$asset_dir"

say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/01.aiff" "検索、比較、予約、支払い。旅行手配は、いくつものサービスに分断されています。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/02.aiff" "最初に、目的、予算、確認条件を設定します。AIへ渡すのは、無制限な財布ではありません。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/03.aiff" "あとは、普段の言葉で依頼します。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/04.aiff" "AIは商品を並べるだけでなく、予算、移動、キャンセル条件を含む、実行可能な旅程を作ります。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/05.aiff" "条件内の取引は、エージェントがステーブルコインで決済し、予約まで完了します。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/06.aiff" "高額、または取り消せない取引だけ、人間に判断を戻します。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/07.aiff" "条件が変われば、勝手に進めず停止し、旅程全体を再調整します。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/08.aiff" "誰の権限で、なぜ支払ったか。判断と取引を追跡できます。"
say -v "$voice_name" -r "$voice_rate" -o "$voice_dir/09.aiff" "AIの判断を、安全で検証可能な経済活動へ。Komlock Lab。"

ffmpeg -y \
  -i "$voice_dir/01.aiff" -i "$voice_dir/02.aiff" -i "$voice_dir/03.aiff" \
  -i "$voice_dir/04.aiff" -i "$voice_dir/05.aiff" -i "$voice_dir/06.aiff" \
  -i "$voice_dir/07.aiff" -i "$voice_dir/08.aiff" -i "$voice_dir/09.aiff" \
  -filter_complex "[0:a]adelay=500:all=1[a0];[1:a]adelay=6500:all=1[a1];[2:a]adelay=17500:all=1[a2];[3:a]adelay=27500:all=1[a3];[4:a]adelay=44500:all=1[a4];[5:a]adelay=57500:all=1[a5];[6:a]adelay=69500:all=1[a6];[7:a]adelay=80500:all=1[a7];[8:a]adelay=85500:all=1[a8];[a0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:duration=longest:dropout_transition=0,apad=pad_dur=90,atrim=duration=90,loudnorm=I=-18:TP=-2:LRA=9[out]" \
  -map "[out]" -c:a aac -b:a 160k "$narration_file"

ffmpeg -y -i "$video_file" -i "$narration_file" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a copy -shortest -movflags +faststart "$final_file"

mv "$final_file" "$video_file"
printf 'Narrated video: %s\n' "$video_file"
