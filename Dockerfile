FROM golang:1.24.2-bookworm

WORKDIR /app

COPY go.* ./

RUN go mod download

COPY . .

RUN go build -o main main.go

EXPOSE 8080

CMD ["./main"]


