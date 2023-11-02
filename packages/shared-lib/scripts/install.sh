#!/bin/bash

arch=$(uname -m)
platform=$(uname -s | tr '[:upper:]' '[:lower:]')
base_url="https://github.com/asg017/sqlite-vss/releases/download/v0.1.2"

vss_extension_filename="vss0.dylib"

if [ "$arch" == "arm64" ] && [ "$platform" == "darwin" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-aarch64.vector0.dylib"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-aarch64.vss0.dylib"
elif [ "$arch" == "x86_64" ] && [ "$platform" == "darwin" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-x86_64.vector0.dylib"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-darwin-x86_64.vss0.dylib"
elif [ "$arch" == "x86_64" ] && [ "$platform" == "linux" ]; then
  vector_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-linux-x86_64.vector0.so"
  vss_extension_url="${base_url}/sqlite-vss-v0.1.2-deno-linux-x86_64.vss0.so"
  vss_extension_filename="vss0.dylib.so"
else
  echo "Unsupported architecture or platform: $arch on $platform"
  exit 1
fi

if [ ! -e "src/lib/vector0.dylib" ]; then
  echo "Downloading vector extension"
  wget -O "src/lib/vector0.dylib" $vector_extension_url
  echo "Downloaded vector extension to" $(pwd) "/src/lib/vector0.dylib"
fi

if [ ! -e "src/lib/"$vss_extension_filename ]; then
  echo "Downloading vss extension"
  wget -O "src/lib/"$vss_extension_filename $vss_extension_url
  echo "Downloaded vss extension to" $(pwd) $vss_extension_filename
fi

if [ ! -e "src/vectors.sqlite" ]; then
  echo "Downloading vectors.sqlite"
  wget -O "src/vectors.sqlite" --no-check-certificate --no-proxy "https://ai-popper-vectors.s3.eu-north-1.amazonaws.com/vectors.sqlite"
  echo "Downloaded vectors.sqlite to" $(pwd) "/src/vectors.sqlite"
fi
