#!/bin/bash
tmux new-session -d \
    && tmux split-window -h 'cd app && yarn && yarn dev --host 0.0.0.0' \
    && tmux split-window -v 'ganache-cli -h 0.0.0.0 -p 7545 -i 5777 -s dhbw' \
    && tmux select-pane -t 0 \
    && tmux -2 attach-session -d
