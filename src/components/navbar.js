import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import logo from "../images/gift.png";
import Button from "react-bootstrap/Button";
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";


const CustomNavbar = ({ links, enableLogout }) => {
    // eslint-disable-next-line no-unused-vars
    const [cookies, setCookie, removeCookie] = useCookies(['watk']);
    let navigate = useNavigate();

    const logout = () => {
        removeCookie("token", { path: "/" });
        navigate("/", { replace: true });
    }

    return (
        <Navbar expand="lg" bg="light" variant="light">
            <Container>
                <Navbar.Brand>
                    <Link to='/' className="removeLinkStyle">
                        <img
                            src={logo}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                            alt="Main logo"
                        />{' '}
                        Workabout
                    </Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        {
                            links.map((l, i) => {
                                return <Nav.Link key={i} href={l.path}>{l.name}</Nav.Link>
                            })
                        }
                    </Nav>
                    {
                        enableLogout ? <Button variant="outline-dark" onClick={logout} size="sm" >Cerrar sesión</Button> : null
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default CustomNavbar;