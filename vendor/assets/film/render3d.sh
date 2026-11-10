#!/bin/bash
# the film's 3D shots, one after the other (SwiftShader, about 13 s a frame)
S=/tmp/claude-0/-home-claude/8daa4172-7fb4-5970-8668-08bf2ab63a0a/scratchpad
cd $S/car/scripts
node shootcam.cjs "http://127.0.0.1:8766/?view=landing&mode=day&fov=24&settle=1&fx=1" $S/film/orbit $S/film/orbit.json 1920 1080 && echo ORBIT_DONE
node shootcam.cjs "http://127.0.0.1:8766/?path=specs&cam=fixed&stagger=specs&mode=day&fov=24&settle=1&fx=1" $S/film/explode $S/film/explode.json 1920 1080 && echo EXPLODE_DONE
