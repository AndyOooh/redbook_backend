#!/bin/bash
# To run: go to this folder and  ./compose-to-remote.sh

# Variables
key_name="aws-redbook2"
key_path="~/.ssh/$key_name.pem"

# From perspective of where script is executed (not where it is located)
# local_file="docker-compose.yaml"
local_file="docker-compose.prod.yaml"
# local_file="Dockerfile"
# local_file="nginx.conf"
# local_file="../nodejs/.env"

remote_user="ec2-user"
remote_ip="52.201.144.84"
remote_folder="./"
# remote_folder="./nodejs"

remote_file="docker-compose.yaml"
# remote_file="Dockerfile"
# remote_file=$local_file


# !! Only copy file to remote machine
scp -i "$key_path" "$local_file" "$remote_user@$remote_ip:$remote_folder/$remote_file"

# !! Copy file to remote machine && append file content on remote machine

# scp -i "$key_path" "$local_file" "$remote_user@$remote_ip:$remote_folder/$remote_file" && \
# destination_file=".bashrc"
# ssh -i "$key_path" "$remote_user@$remote_ip" "cat $remote_folder/$remote_file >> $remote_folder/$destination_file"

# !! Only ssh int remote machine
# ssh -i "$key_path" "$remote_user@$remote_ip"


