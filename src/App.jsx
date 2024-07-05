import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Button, Container, Form, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const socket = useMemo(() => io("https://chat-backend-quick.vercel.app"), []);


  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState(""); // State to hold username input
  const [usernameSet, setUsernameSet] = useState(false); // State to track if username is set

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (roomName.trim() !== "" && username.trim() !== "") {
      // Only submit if both fields are filled
      socket.emit("joinroom", roomName.trim());
      setRoom(roomName.trim());
      setUsername(username.trim());
      setRoomName(""); // Clear room name field
      setUsernameSet(true); // Mark username as set
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (msg.trim() !== "") {
      // Ensure message is not empty
      socket.emit("message", { msg, room, username, socketId: socket.id }); // Emit socket.id with the message
      setMsg("");
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected " + socket.id);
    });

    socket.on("welcome", (data) => {
      console.log(data);
    });

    socket.on("recmsg", (data) => {
      console.log(data);
      setMsgs((prevMsgs) => [...prevMsgs, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <Container className="py-5">
      <Row className="d-flex justify-content-center">
        <Col md={10} lg={8} xl={6}>
          <Card id="chat2">
            <Card.Header className="d-flex justify-content-between align-items-center p-3">
              <h5 className="mb-0">Chat</h5>
              <Button variant="primary" size="sm">
                Let's Chat App
              </Button>
            </Card.Header>

            <Card.Body className="overflow-auto" style={{ height: "400px" }}>
              <div className="message-container">
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={`message-wrapper ${
                      m.socketId !== socket.id ? "message-right" : "message-left"
                    }`}
                  >
                    <p
                      className={`message-text p-2 rounded-3 ${
                        m.socketId !== socket.id
                          ? "bg-primary text-white"
                          : "bg-body-tertiary"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      <span className="text-muted">{m.username}</span>
                      <br />
                      {m.msg}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer className="text-muted d-flex justify-content-start align-items-center p-3">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                alt="avatar 3"
                style={{ width: "40px", height: "100%" }}
              />
              <Form onSubmit={handleSubmit} className="d-flex flex-grow-1">
                <Form.Control
                  type="text"
                  placeholder="Type message"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="form-control form-control-lg"
                  disabled={!usernameSet} // Disable input if username is not set
                />
                <Button
                  className="ms-3"
                  variant="link"
                  type="submit"
                  disabled={!usernameSet} // Disable button if username is not set
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </Form>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          {!usernameSet && ( // Show username form only if username is not set
            <Form onSubmit={handleFormSubmit}>
              <h5>Join Room and Enter Username</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter room name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                Join
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
