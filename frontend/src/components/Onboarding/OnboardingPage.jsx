import React, { useState } from 'react';
import { Form, Button, Container, Col, Table, Card, Accordion } from 'react-bootstrap';
import AccordionBody from 'react-bootstrap/esm/AccordionBody';

const DAYS_OF_WEEK = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

const OnboardingPage = () => {
  // Step 1 state
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  // Step 2 state
  const [organizationName, setOrganizationName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  // Step 3 state
  const [employeeSchedules, setEmployeeSchedules] = useState([]);

  const handleOwnerOrAdminChange = (e) => {
    setIsOwnerOrAdmin(e.target.checked);
  };

  const handleOrganizationNameChange = (e) => {
    setOrganizationName(e.target.value);
  };

  const handleNewEmployeeChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, newEmployee]);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  const handleEmployeeScheduleChange = (employeeIndex, dayOfWeek, start, end) => {
    const updatedEmployeeSchedules = [...employeeSchedules];
    updatedEmployeeSchedules[employeeIndex][dayOfWeek] = { start, end };
    setEmployeeSchedules(updatedEmployeeSchedules);
  };

  const handleSubmit = () => {
    // submit data to server
    const initEvents = employees.map((employee) => {
      return {
        calendarId: employee.id,
        category: 'time',
        isVisible: true,
        title: 'Work',
        id: employee.id,
        body: 'Work Schedule',
        start: employeeSchedules[employee.id]?.Sunday?.start,
        end: employeeSchedules[employee.id]?.Sunday?.end,
      };
    });

    const calendarData = {
      userId: '6438f8eea5398febfc3e8abd',
      events: initEvents,
    };

    console.log(calendarData);
  };

  return (
    <Container>
      <h1>Onboarding Page</h1>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Step 1: Are you a business owner or administrator?</Accordion.Header>
          <Accordion.Collapse eventKey="0">
            <Accordion.Body>
              <Form.Check
                type="checkbox"
                label="Yes, I am a business owner or administrator."
                checked={isOwnerOrAdmin}
                onChange={handleOwnerOrAdminChange}
              />
              <Form.Group>
                <Form.Label>Organization Name</Form.Label>
                <Form.Control type="text" value={organizationName} onChange={handleOrganizationNameChange} />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Collapse>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Step 2: Input the name of the organization and add employees.</Accordion.Header>
          <Accordion.Collapse eventKey="1">
            <Accordion.Body>
              <Form.Group>
                <Form.Label>Organization Name</Form.Label>
                <Form.Control type="text" value={organizationName} onChange={handleOrganizationNameChange} />
              </Form.Group>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={index}>
                      <td>{employee.firstName}</td>
                      <td>{employee.lastName}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
            </Accordion.Body>
          </Accordion.Collapse>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Step 3: Set employee schedules.</Accordion.Header>
          <Accordion.Collapse eventKey="2">
            <Accordion.Body>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Sunday</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                    <th>Saturday</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={index}>
                      <td>{`${employee.firstName} ${employee.lastName}`}</td>
                      {Object.entries(DAYS_OF_WEEK).map(([key, value]) => (
                        <td key={key}>
                          <Form.Control
                            type="text"
                            placeholder="Start time"
                            value={employeeSchedules[index][key]?.start || ''}
                            onChange={(e) => handleEmployeeScheduleChange(index, key, e.target.value, employeeSchedules[index][key]?.end)}
                          />
                          <Form.Control
                            type="text"
                            placeholder="End time"
                            value={employeeSchedules[index][key]?.end || ''}
                            onChange={(e) => handleEmployeeScheduleChange(index, key, employeeSchedules[index][key]?.start, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button onClick={handleSubmit}>Submit</Button>
            </Accordion.Body>
          </Accordion.Collapse>
          </Accordion.Item>
      </Accordion>
    </Container>
  )
}

export default OnboardingPage
