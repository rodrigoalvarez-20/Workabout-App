import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";


const SideEventInfo = ({ btnVariant, btnText, data: { code, name, topics, max_amount, participants, deadline, exchange_date, requested, comments } }) => {
    const [show, setShow] = useState(false);

    const toogleClose = () => setShow(false);
    const toogleShow = () => setShow(true);

    const renderArray = (array, color) => {
        return array.map(p => {
            return <ListGroup.Item variant={color} key={p["email"]}>{p["name"]} - {p["pref"]}</ListGroup.Item>
        })
    }

    return (
        <>
            <Button variant={btnVariant} onClick={toogleShow}>
                {btnText}
            </Button>

            <Offcanvas show={show} onHide={toogleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{name}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item>Codigo del evento: {code}</ListGroup.Item>
                        <ListGroup.Item>Temas del evento: {topics.join(", ")}</ListGroup.Item>
                        <ListGroup.Item>Presupuesto maximo: ${max_amount}</ListGroup.Item>
                        <ListGroup.Item>Participantes:</ListGroup.Item>
                        {renderArray(participants, "info")}
                        {
                            deadline ? <ListGroup.Item>Fecha maxima de registro: {deadline}</ListGroup.Item> : null
                        }
                        <ListGroup.Item>Fecha del intercambio: {exchange_date}</ListGroup.Item>
                        <ListGroup.Item>Pendientes:</ListGroup.Item>
                        {renderArray(requested, "warning")}
                        {
                            comments ? <ListGroup.Item>Comentarios: {comments}</ListGroup.Item> : null
                        }

                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );

}

export default SideEventInfo;