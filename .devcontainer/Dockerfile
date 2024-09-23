FROM mcr.microsoft.com/vscode/devcontainers/base:1-ubuntu-22.04@sha256:3781234029ccd1363a88254cb2893adb503eb2c0eaf042ac599ba23bceab7519

RUN apt update && apt install -y tig tmux vim
RUN curl -sSfL -O https://raw.githubusercontent.com/aquaproj/aqua-installer/v3.0.1/aqua-installer && \
  echo "fb4b3b7d026e5aba1fc478c268e8fbd653e01404c8a8c6284fdba88ae62eda6a  aqua-installer" | sha256sum -c && \
  chmod +x aqua-installer && \
  ./aqua-installer
