#!/bin/bash
name=${PWD##*/}
(cd .. && tar czf "$name.tar.gz" "$name" && scp "$name.tar.gz" pi@retropie.local:)
ssh pi@retropie.local "tar xf $name.tar.gz"
