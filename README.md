# Teaching-HEIGVD-RES-2020-Labo-Orchestra

## Admin

* **You can work in groups of 2 students**.
* It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**. 
* We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Telegram / Teams, so that everyone in the class can benefit from the discussion.

## Objectives

This lab has 4 objectives:

* The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

* The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

* The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

* Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.


## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

* the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

* the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)


### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound         |
|------------|---------------|
| `piano`    | `ti-ta-ti`    |
| `trumpet`  | `pouet`       |
| `flute`    | `trulu`       |
| `violin`   | `gzi-gzi`     |
| `drum`     | `boum-boum`   |

### TCP-based protocol to be implemented by the Auditor application

* The auditor should include a TCP server and accept connection requests on port 2205.
* After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab


You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 5 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```
When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.


## Task 1: design the application architecture and protocols

| #  | Topic |
| --- | --- |
|Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands? |
| | <img src="images/truc-machin.gif"> |
|Question | Who is going to **send UDP datagrams** and **when**? |
| | *It's the musicians who will send UDP datagrams. They will emit UDP datagrams in multi-cast to everyone who want to listen. They will emit each time they make a sound* |
|Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received? |
| | *The auditor will listen on the multi-cast for reception of datagrams. Every time he will receive datagram he will stock the musician and the actual date-time* |
|Question | What **payload** should we put in the UDP datagrams? |
| | *We will need 2 important things, the sound that was emit and a uuid or something to identify who send the datagram. Otherwise we won't be able to know which musician emitted the sound and we don't will be able to know if a musician is always up.* |
|Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures? |
| | *For the Auditor part we will use a dynamic array (Map) to store the information on who his active or not. A js class will define the Musicians. This class will store multiple informations and functions; but the most important are: an update function, his uuid, the type of instrument and the sound emitted.<br />These structures will be updated every time a musician plays his instrument and every time the a TCP connection is made to the auditor.* |


## Task 2: implement a "musician" Node.js application

| #  | Topic |
| ---  | --- |
|Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**? |
| | *Simply by using JSON.stringify offered by JS. This make a json string*  |
|Question | What is **npm**?  |
| | *NPM is a dependencies manager for the js file. For comparison we have composer for the php files. It's useful for project because we can set a bunch of dependencies and the version we need. After that anybody can get our code and just make npm install for installing all needed dependencies without the need to transfer all the files. But the most important feature is the management of dependencies redundancies. This describes the needed dependencies for one dependencies and makes a network of dependencies. This way we can know if we can update a dependence, and what dependencies need to be updates in the same time. It is a centralized packet manager, all the dependencies are on the Internet to make it easy to get and to know what exist.* POIL |
|Question | What is the `npm install` command and what is the purpose of the `--save` flag?  |
| | *the `npm install` command allows us to install the required dependency. the flag `--save` is useful to save the dependencies in our package.json file. This file contains all our dependencies.* |
|Question | How can we use the `https://www.npmjs.com/` web site?  |
| | *Like I said before, it's very convenient because we can search an existing package on the website.*  |
|Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122? |
| | *We can either make an compliant RFC4122 function OR we can get the magnific uuid package that is compliant.*  |
|Question | In Node.js, how can we execute a function on a **periodic** basis? |
| | *We can very easily make a periodic function. We just need to define a function in our class and to call this one with the setInterval js function in the constructor*  |
|Question | In Node.js, how can we **emit UDP datagrams**? |
| | *In order to emit UDP datagrams, we can use the standard Node.js module : dgram* |
|Question | In Node.js, how can we **access the command line arguments**? |
| | *By accessing the argv properties of `process`* |


## Task 3: package the "musician" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we **define and build our own Docker image**?|
| | *We have to define a Dockerfile. To build we use :* `docker build --tag res/musician --file ./docker/image-musician/Dockerfile ./docker/image-musician/`<br />`docker build`: docker command to build the image<br />`--tag res/musician`: the name of our image<br />`--file ./docker/image-musician/Dockerfile ./docker/image-musician/` :  name and place of the Dockerfile and its context. |
|Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?  |
| | *For passing the argument from docker to our js, we just need to add that ENTRYPOINT in our dockerfile. We define here where the args are going when running the container.*  |
|Question | After building our Docker image, how do we use it to **run containers**?  |
| | *We use the docker run command and we specified the name of our image and the instrument. like that __docker run -d res/musician piano__*  |
|Question | How do we get the list of all **running containers**?  |
| | *You can do `docker ps` and you have the list of running container* |
|Question | How do we **stop/kill** one running container?  |
| | *after getting the name of our __docker ps__ with the docker ps cmd, we do __docker kill [NAME_CONTAINER]__ For stopping one we use the __docker stop__ cmd*  |
|Question | How can we check that our running containers are effectively sending UDP datagrams?  |
| | *With the `tcpdump` function and look in the traffic that is reported. (WireShark would also be an option)* |


## Task 4: implement an "auditor" Node.js application

| #  | Topic |
| ---  | ---  |
|Question | With Node.js, how can we listen for UDP datagrams in a multicast group? |
| | *We have to subscribe to the multicast port and address*     |
|Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**?  |
| | *We can use the Map object for stocking our active musician.* |
|Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?  |
| | *It can be convenient for storing the date and output in a particular format for the user. Is is also quite useful in order to perform date-time manipulations and operations.* |
|Question | When and how do we **get rid of inactive players**?  |
| | *To get rid of the inactive players, we go through the Map containing all the players, and remove the ones that have not been active longer than 5 seconds<br />This is done at two moments : when the auditor receives a "sound"  and when a TCP connection is made to the auditor.* |
|Question | How do I implement a **simple TCP server** in Node.js?  |
| | We used the node.js `net` library. This library allows us to create the TCP server, allowing us to subscribe to events (a connexion) and to respond to them with a custom function. |


## Task 5: package the "auditor" app in a Docker image

| #  | Topic |
| ---  | --- |
|Question | How do we validate that the whole system works, once we have built our Docker image? |
| | we run the `validate.sh`file and admire the wonderful validation approval :<br /><img src="images/imgpsh_mobile_save.jpg"  alt="validation"> |



## Constraints

Please be careful to adhere to the specifications in this document, and in particular

* the Docker image names
* the names of instruments and their sounds
* the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should try to run it.
