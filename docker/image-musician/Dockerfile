FROM node:10
MAINTAINER Jérémy Corbaz <jeremy.corbaz@heig-vd.ch>, Edouard de Chambrier <edouard.dechambrier@heig-vd.ch>

# Install npm dependencies
RUN  "npm install --save uuid"

#
# When we build the image, we copy the executable jar in the image file system.
#
COPY src /opt/app/

CMD ["node", "/opt/app/musician.js"]

