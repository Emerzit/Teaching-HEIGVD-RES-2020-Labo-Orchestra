FROM node:10
MAINTAINER Jérémy Corbaz <jeremy.corbaz@heig-vd.ch>, Edouard de Chambrier <edouard.dechambrier@heig-vd.ch>

# Note the json syntax on this next line is strict, double quotes, and any syntax
# error will result in a shell being used to run the line.
ENTRYPOINT [ "node","/opt/app/musician.js"]

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install npm dependencies
RUN  npm install

#
# When we build the image, we copy the executable jar in the image file system.
#
COPY src /opt/app/

CMD ["node", "/opt/app/musician.js"]

