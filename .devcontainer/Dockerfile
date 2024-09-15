FROM mcr.microsoft.com/vscode/devcontainers/base:1-ubuntu-22.04@sha256:213c08a4c19c0b13e865c3464d093c85b1ad9b860ce01ee2ea3f4c5ab2f5733a

RUN apt update && apt install -y tig tmux vim
RUN curl -sSfL -O https://raw.githubusercontent.com/aquaproj/aqua-installer/v3.0.1/aqua-installer && \
  echo "fb4b3b7d026e5aba1fc478c268e8fbd653e01404c8a8c6284fdba88ae62eda6a  aqua-installer" | sha256sum -c && \
  chmod +x aqua-installer && \
  ./aqua-installer
