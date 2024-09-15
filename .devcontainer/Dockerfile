FROM mcr.microsoft.com/vscode/devcontainers/base:1-ubuntu-22.04@sha256:a3f6ea3b1c7eafa85b6ff8a7c75dcf53b11aa08872eade6352cbd9c6d2016ab3

RUN apt update && apt install -y tig tmux vim
RUN curl -sSfL -O https://raw.githubusercontent.com/aquaproj/aqua-installer/v3.0.1/aqua-installer && \
  echo "fb4b3b7d026e5aba1fc478c268e8fbd653e01404c8a8c6284fdba88ae62eda6a  aqua-installer" | sha256sum -c && \
  chmod +x aqua-installer && \
  ./aqua-installer
