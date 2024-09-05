#!/bin/bash
git describe --always --tags --dirty --match v* > gui-version.txt
