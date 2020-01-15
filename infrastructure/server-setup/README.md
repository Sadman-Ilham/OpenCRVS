<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [OpenCRVS server setup](#opencrvs-server-setup)
  - [Enabling encryption](#enabling-encryption)
  - [Enabling Mongo replica sets](#enabling-mongo-replica-sets)
  - [Emergency Backup & Restore](#emergency-backup--restore)
  - [How to know when to scale a service](#How to know when to scale a service)
  - [Some useful Docker and Docker Swarm commands](#some-useful-docker-and-docker-swarm-commands)
    - [You have made a change to OpenHIM base config. Before you deploy, take down the entire stack](#you-have-made-a-change-to-openhim-base-config-before-you-deploy-take-down-the-entire-stack)
    - [To check the status of all running services](#to-check-the-status-of-all-running-services)
    - [To scale a service that hasn't started, in order to check for bugs](#to-scale-a-service-that-hasn't-started-in-order-to-check-for-bugs)
    - [To check the logs on a service](#to-check-the-logs-on-a-service)
    - [To check logs or access a specific container](#to-check-logs-or-access-a-specific-container)
    - [You need to check logs on the container](#you-need-to-check-logs-on-the-container)
    - [You need to run commands inside a container](#you-need-to-run-commands-inside-a-container)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# OpenCRVS server setup

This folder contains script to setup a new set of servers for OpenCRVS. It sets up docker swarm and configures the servers to prepare them for a deployment for OpenCRVS.

Ansible is required to run the server setup. This should be installed on your local machine. Also ensure that you have ssh access with the root user to all the server that you are trying to configure.

Add your users GIT SSH keys to all nodes

```
curl https://github.com/<git-user>.keys >> ~/.ssh/authorized_keys
```

Ensure the manager node can ssh into worker nodes (Required for automated backups)

SSH into manager node and create ssh key. Press Enter for defaults and no passphrase

```
ssh-keygen
```

Print the key for copying:

```
cat ~/.ssh/id_rsa.pub
```

Copy the key and SSH into worker nodes to add manager key into node authorised keys, and repeat for all workers

```
echo "<manager-node-public-key>" >> ~/.ssh/authorized_keys
```

Edit the automatic cron job backup to suit your external server set-up on line 64 of the Ansible playbook.yml

```
job: 'cd ~/ && bash /tmp/compose/infrastructure/emergency-backup-metadata.sh <ssh-user> <external-server-for-remote-backup-host> <ssh-port> <your-production-environment-manger-node-host> <path-to-encrypted-volume-on-external-server> >> /var/log/opencrvs-backup.log 2>&1'
```

Ensure your external server also allows SSH from the OpenCRVS manager node. Follow the same process as per the workers

Create an inventory file `your-environment.ini`. You can use the example file in `example-environment.ini`.

Run the Ansible playbook configuration script from your client computer (You must have Ansible installed, a Dockerhub account & a Papertrail account - remove Papertrail config from playbook if you do not wish to use the logging service. We recommend you use an external Logging service to have live access to logs):

```
ansible-playbook -i <inventory_file> playbook.yml -e "dockerhub_username=your_username dockerhub_password=your_password papertrail_token=your_papertrail_token"
```

Replace <inventory_file> with the correct inventory file and use `-K` option if you need supply an ssh password (add ansible_password to inventory for each node that requires an SSH password). These files contain the list of servers which are to be configured. Use the `-b` option if your servers require sudo to perform the ansible tasks. If you are setting up a new set of servers, you will need to create a new file.

## Enabling encryption

For production servers we offer the ability to setup an encrypted /data folder for the docker containers to use. This allows us to support encryption at rest. To do this run the ansible script with these extra variables. Note, if the server is already setup the docker stack must be stopped and ALL DATA WILL BE LOST when switching to an ecrypted folder. It is useful to set this up from the beginning.

```
ansible-playbook -i <inventory_file> playbook.yml -e "dockerhub_username=your_username dockerhub_password=your_password papertrail_token=your_papertrail_token encrypt_passphrase=<a_strong_passphrase> encrypt_data=True"
```

Once this command is finished the servers are now prepared for an OpenCRVS deployment.

Before the deployment can be done a few secrets need to be manually added to the docker swarm:

ssh into the leader manager and run the following, replacing the values with the actual secrets:

```sh
# For Bangladesh DHIS2 medaitor, allows birth notification API access to the OpenHIM
printf "<openhim-user>" | docker secret create openhim-user -
printf "<openhim-password>" | docker secret create openhim-password -
```

```sh
# For Bangladesh NID API integration
printf "<oisf-secret>" | docker secret create oisf-secret -
```

ssh into the leader manager and run the following, replacing the following values with the actual secrets for your SMS provider of choice:

```sh
# For Zambia we use Clickatell, we have found good Telco coverage in Africa with this provider
printf "<clickatell-user>" | docker secret create clickatell-user -
printf "<clickatell-password>" | docker secret create clickatell-password -
printf "<clickatell-api-id>" | docker secret create clickatell-api-id -

# For Bangladesh we use Infobip, we have found good Telco coverage in Asia with this provider
printf "<infobip-gateway-endpoint>" | docker secret create infobip-gateway-endpoint -
printf "<infobip-api-key>" | docker secret create infobip-api-key -
printf "<infobip-sender-id>" | docker secret create infobip-sender-id -

```

After creating the secrets make sure the commands are removed from the shell history

Also, if you can't ssh into the manager as root you will need to add your ssh user to be able to run docker commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

Note: the Ansible script will install the UFW firewall, however, Docker manages it's own iptables. This means that even if there are UFW rules to block certain ports these will be overridden for ports where Docker is publishing a container port. Ensure only the necessary ports are published via the docker-compose files. Only the necessary ports are published by default, however, you may want to check this when doing security audits.

Synthetic records will need to be created, enabling SSL and permanently directing the following subdomains for the Traefik SSL cert to be succcessfully generated:

api.<your_domain>
auth.<your_domain>
gateway.<your_domain>
login.<your_domain>
openhim.<your_domain>
openhim-api.<your_domain>
performance.<your_domain>
register.<your_domain>
resources.<your_domain>
styleguide.<your_domain>
monitor.<your_domain>

Now, in the package.json file in the root folder of the repository, amend the deployment script appropriately:

```
"deploy": "SSH_USER=<<your_ssh_username>> SSH_HOST=<<your_swarm_manager_node_ip>> bash deploy.sh",
```

You may also add the following variables to the above that will change the username and password for monitoring service, Netdata, away from the default of monitor:monitor-password. `NETDATA_USER=<username> NETDATA_PASSWORD=<password>`

Then, run the deployment like so:

```
yarn deploy <<insert country code>> --clear-data=yes --restore-metadata=yes <<insert host domain e.g.: opencrvs.your_country.org>> <<insert version e.g.: latest>>
```

Version can be any git commit hash, git tag, dockerhub tag or 'latest'

## Enabling Mongo replica sets

Mongo is enabled with replica sets in order to provide backup in case a node fails. When the deploy script runs, the mongo-rs-init container waits 20s before trying to setup the replica set. If the mongo instances aren't up by then then there is a chance that the deployment will fail. You can recognise this by the following error in the opencrvs_mongo service logs `Unable to reach primary for set rs0`. Run `docker service ls` to see if the replicas have scaled or not. Running the following commands manually scales the replica set, and allows you to continue.

```
docker service scale opencrvs_mongo-rs-init=0
docker service scale opencrvs_mongo-rs-init=1
```

## Emergency Backup & Restore

Every day OpenCRVS automatically backs up all databases to the following directories on the manager node.
Every 7 days the data is overwritten to save disk space.

Servers can be stolen, so we highly recommend that once a week, these files should be saved to a
password protected and encrypted external harddrive and stored in a secure and approved location.

Hearth, OpenHIM and the Users database is saved in a mongo zip file here:

```
/data/backups/mongo/hearth-dev-<date>.gz
/data/backups/mongo/openhim-dev-<date>.gz
/data/backups/mongo/user-mgnt-<date>.gz
```

Elasticsearch snapshot files and indices are saved here:

```
/data/backups/elasticsearch
```

InfluxDB backup files are saved here:

```
/data/backups/influxdb/<date>
```

To perform a restore, ensure that you have backup files in the day's folders you wish to restore from.

Backup files:

The Hearth, OpenHIM and User db backup zips you would like to restore from: hearth-dev-{date}.gz, openhim-dev-{date}.gz and user-mgnt-{date}.gz must exist in /data/backups/mongo/{date} folder
The Elasticsearch backup folder /data/backups/elasticsearch must exist with all previous snapshots and indices. All files are required
The InfluxDB backup files must exist in the /data/backups/influxdb/{date} folder

1. SSH into the manager node
2. Make sure you are a root user
3. cd to the /tmp/compose/infrastructure directory

Run the following script as root but beware that **ALL DATA WILL BE REPLACED BY YOUR BACKUP DATA**

```
./emergency-restore-metadata.sh <day of the week to restore from>
```

## How to know when to scale a service

OpenCRVS uses the [Netdata](https://www.netdata.cloud/) tool for server and container monitoring. This would be your first stop to determine how your servers are operating and if they are keeping up with the load.

Access Netdata by visiting: https://monitor.<your_domain>

In the top left you will see a dropdown. From here you may select each of the servers in your swarm. The first step you should take is to determine if any/all of the servers are at capacity. Thing you should look for include:

- A constantly maxed out CPU percentage or load number
- If IOWAIT is constantly high your disks are becoming a bottleneck
- Check RAM usage to make sure the server isn't paging (linux systems always try use as much RAM as possible, what you are looking for is high number with almost no caching)
- Check if Netadata has any active alarms on any of the servers

If all of the server are running at capacity you might need to add more servers to the swarm. If just a few are at capacity then you should try to figure out which containers are using the most resources and scale those out so other server may take the load.

To do this, first check the 'Applications' section in Netdata and see if it really is the containers using up system resources, it could be another rouge process.

Next, go through each of the docker containers listed on the menu on the left in Netdata. Try to find which one is using the majority of the resources. Look for constantly high CPU or Disk usage. If you find a culprit you may increase the number of replicas of that service using:

```
docker service scale <service name e.g.: "opencrvs_workflow">=5
```

After this is done, watch Netdata and ensure that the change was effective and ensure there aren't any other services that are also at capacity. In some cases the only answer may be to [add additional servers to the docker swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/). To get tasks to move to the new server you can scale down certain service and scale them back up again or you can [force a rebalance](https://docs.docker.com/engine/swarm/admin_guide/#force-the-swarm-to-rebalance) which may lead to so down time.

You may want to [setup notifications](https://docs.netdata.cloud/health/notifications/) in Netdata as well so that you may be notified of any alarms on the servers.

## Some useful Docker and Docker Swarm commands

The following docker commands are helpful when managing OpenCRVS and debugging infrastructure issues

### To check the status of all running services

```
docker service ls
```

### To scale a service that hasn't started, in order to check for bugs

```
docker service scale <service name e.g.: "opencrvs_metrics">=1
```

### You want to get all stack information and see if there are any errors

docker stack ps opencrvs —no-trunc

### To check the logs on a service

```
docker service logs <service name e.g.: "opencrvs_metrics">
```

### To check logs or access a specific container

You need to check Docker swarm for the id of the containers running mongo, elasticsearch or resources in order to access
To find which node hosts the container you are looking for, run this command on the manager node.

```
docker stack ps -f "desired-state=running" opencrvs
```

After running the previous command to discover which node is running a container, SSH into the right node and run the following to get the container id

```
docker ps
```

### You need to check logs on the container

```
docker logs -f <container id e.g. "opencrvs_user-mgnt.1.t0178z73i4tjcll68a7r72enu">
```

### You need to run commands inside a container

```
docker exec -it <container-id> <command e.g. "ls", "mongo", "printenv", "influxd">
```

Running

```
netstat -plant
```

Inside a container will tell you which ports are open and listening

### You need to inspect a container to see networking and all other information

```
docker ps # to get the container id
docker inspect <container id e.g. "opencrvs_user-mgnt.1.t0178z73i4tjcll68a7r72enu">
```

### You need to rollback the changes made to a service

docker service rollback opencrvs_user-mgnt
