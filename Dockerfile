FROM node:latest

RUN mkdir -p /home/toolmaker

COPY . /home/toolmaker

WORKDIR /home/toolmaker

ENV HOST 0.0.0.0
ENV PORT 3000

EXPOSE 3000

CMD ["npm", "start"]