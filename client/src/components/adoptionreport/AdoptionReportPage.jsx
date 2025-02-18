import './AdoptionReport.css';

import {
    Grid,
    Image,
    Icon,
    Segment,
    Header,
    Button,
    Modal,
    Form,
    Input,
    Checkbox,
    Divider
} from 'semantic-ui-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import useGlobalError from '../error/ErrorHooks.js';
import {
    iAmOptions,
    libreNetOptions,
    studentUseOptions,
    getInstructionTermOptions,
} from './AdoptionReportOptions.js';
import { libraryOptions } from '../util/LibraryOptions';
import { isEmptyString } from '../util/HelperFunctions.js';

const AdoptionReportPage = (props) => {

    // Global State and Error Handling
    const { handleGlobalError } = useGlobalError();
    const org = useSelector((state) => state.org);

    // UI
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    /** Data **/
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [iAm, setIAm] = useState('');
    const [comments, setComments] = useState('');

    // Instructor
    const [libreNetInst, setLibreNetInst] = useState('');
    const [instrInstName, setInstrInstName] = useState('');
    const [instrClassName, setInstrClassName] = useState('');
    const [instrTaughtTerm, setInstrTaughtTerm] = useState('');
    const [instrNumStudents, setInstrNumStudents] = useState(0);
    const [instrResourceURL, setInstrResourceURL] = useState('');
    const [instrResourceLib, setInstrResourceLib] = useState('');
    const [instrReplaceCost, setInstrReplaceCost] = useState(0);
    const [instrPrintCost, setInstrPrintCost] = useState(0);
    const [instrStudentAccess, setInstrStudentAccess] = useState(
        new Array(5).fill(false)
    );

    // Student
    const [studentUse, setStudentUse] = useState('');
    const [studentInst, setStudentInst] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [studentInstr, setStudentInstr] = useState('');
    const [studentQuality, setStudentQuality] = useState(0);
    const [studentNavigate, setStudentNavigate] = useState(0);
    const [studentPrintCost, setStudentPrintCost] = useState(0);
    const [studentAccess, setStudentAccess] = useState(
        new Array(5).fill(false)
    );

    // Form Errors
    const [emailErr, setEmailErr] = useState(false);
    const [nameErr, setNameErr] = useState(false);
    const [iAmErr, setIAmErr] = useState(false);
    const [libreNetInstErr, setLibreNetInstErr] = useState(false);
    const [instrInstNameErr, setInstrInstNameErr] = useState(false);
    const [instrClassNameErr, setInstrClassNameErr] = useState(false);
    const [instrTaughtTermErr, setInstrTaughtTermErr] = useState(false);
    const [instrNumStudentsErr, setInstrNumStudentsErr] = useState(false);
    const [instrResLibErr, setInstrResLibErr] = useState(false);

    const instrTaughtOptions = getInstructionTermOptions();

    /**
     * Update page title.
     */
    useEffect(() => {
        document.title = "LibreCommons | Adoption Report";
    }, []);


    /** Form input handlers **/
    const handleInputChange = (e) => {
        switch (e.target.id) {
            case 'ar-email-input':
                setEmail(e.target.value);
                break;
            case 'ar-name-input':
                setName(e.target.value);
                break;
            case 'ar-not-libre-inst-input':
                setInstrInstName(e.target.value);
                break;
            case 'ar-instr-class-input':
                setInstrClassName(e.target.value);
                break;
            case 'ar-instr-num-students-input':
                setInstrNumStudents(e.target.value);
                break;
            case 'ar-instr-resource-url':
                setInstrResourceURL(e.target.value);
                break;
            case 'ar-instr-replace-cost-input':
                setInstrReplaceCost(e.target.value);
                break;
            case 'ar-instr-print-cost-input':
                setInstrPrintCost(e.target.value);
                break;
            case 'ar-student-inst-input':
                setStudentInst(e.target.value);
                break;
            case 'ar-student-class-input':
                setStudentClass(e.target.value);
                break;
            case 'ar-student-instructor-input':
                setStudentInstr(e.target.value);
                break;
            case 'ar-student-print-cost-input':
                setStudentPrintCost(e.target.value);
                break;
            case 'ar-addtl-comments-input':
                setComments(e.target.value);
                break;
            default:
                break // Silence React warning
        }
    };

    const handleInstrStudentAccessChange = (index) => {
        const updated = instrStudentAccess.map((item, idx) => {
            if (index === idx) {
                return !item;
            } else {
                return item;
            }
        });
        setInstrStudentAccess(updated);
    };

    const handleStudentAccessChange = (index) => {
        const updated = studentAccess.map((item, idx) => {
            if (index === idx) {
                return !item;
            } else {
                return item;
            }
        });
        setStudentAccess(updated);
    };

    const handleLibreNetInstChange = (_e, { value }) => {
        setLibreNetInst(value);
    };

    const handleStudentQualityChange = (_e, { value }) => {
        setStudentQuality(value);
    };

    const handleStudentNavigateChange = (_e, { value }) => {
        setStudentNavigate(value);
    };


    /**
     * Validate the form data, return
     * 'true' if all fields are valid,
     * 'false' otherwise
     */
    const validateForm = () => {
        var validForm = true;
        if (isEmptyString(email)) {
            validForm = false;
            setEmailErr(true);
        }
        if (isEmptyString(name)) {
            validForm = false;
            setNameErr(true);
        }
        if (isEmptyString(iAm)) {
            validForm = false;
            setIAmErr(true);
        }
        if (iAm === 'instructor') {
            if (isEmptyString(libreNetInst)) {
                validForm = false;
                setLibreNetInstErr(true);
            }
            if (isEmptyString(instrInstName)) {
                validForm = false;
                setInstrInstNameErr(true);
            }
            if (isEmptyString(instrClassName)) {
                validForm = false;
                setInstrClassNameErr(true);
            }
            if (isEmptyString(instrTaughtTerm)) {
                validForm = false;
                setInstrTaughtTermErr(true);
            }
            if (instrNumStudents === 0) {
                validForm = false;
                setInstrNumStudentsErr(true);
            }
            if (isEmptyString(instrResourceLib)) {
                validForm = false;
                setInstrResLibErr(true);
            }
        }
        return validForm;
    };


    /**
     * Reset all form error states.
     */
    const resetFormErrors = () => {
        setEmailErr(false);
        setNameErr(false);
        setIAmErr(false);
        setLibreNetInstErr(false);
        setInstrInstNameErr(false);
        setInstrClassNameErr(false);
        setInstrTaughtTermErr(false);
        setInstrNumStudentsErr(false);
        setInstrResLibErr(false);
    };


    /**
     * Submit data via POST to the server, then
     * call closeModal() on success.
     */
    const submitReport = () => {
        setSubmitLoading(true);
        resetFormErrors();
        if (validateForm()) {
            const formData = {
                email: email,
                name: name,
                role: iAm,
                comments: comments,
                resource: {}
            };
            if (iAm === 'instructor') {
                let postInstrStudentAccess = [];
                instrStudentAccess.forEach((item, idx) => {
                    switch (idx) {
                        case 0:
                            if (item === true) postInstrStudentAccess.push('online');
                            break;
                        case 1:
                            if (item === true) postInstrStudentAccess.push('print');
                            break;
                        case 2:
                            if (item === true) postInstrStudentAccess.push('pdf');
                            break;
                        case 3:
                            if (item === true) postInstrStudentAccess.push('lms');
                            break;
                        case 4:
                            if (item === true) postInstrStudentAccess.push('librebox');
                            break;
                        default:
                            break; // silence React warning
                    }
                });
                if (!isEmptyString(instrResourceURL)) {
                    formData.resource.link = instrResourceURL;
                }
                formData.resource.library = instrResourceLib;
                formData.instructor = {
                    isLibreNet: libreNetInst,
                    institution: instrInstName,
                    class: instrClassName,
                    term: instrTaughtTerm,
                    students: instrNumStudents,
                    replaceCost: instrReplaceCost,
                    printCost: instrPrintCost,
                    access: postInstrStudentAccess
                };
            } else if (iAm === 'student') {
                let postStudentAccess = [];
                studentAccess.forEach((item, idx) => {
                    switch (idx) {
                        case 0:
                            if (item === true) postStudentAccess.push('online');
                            break;
                        case 1:
                            if (item === true) postStudentAccess.push('print');
                            break;
                        case 2:
                            if (item === true) postStudentAccess.push('pdf');
                            break;
                        case 3:
                            if (item === true) postStudentAccess.push('lms');
                            break;
                        case 4:
                            if (item === true) postStudentAccess.push('librebox');
                            break;
                        default:
                            break; // silence React warning
                    }
                });
                formData.student = {
                    use: studentUse,
                    institution: studentInst,
                    class: studentClass,
                    instructor: studentInstr,
                    quality: studentQuality,
                    navigation: studentNavigate,
                    printCost: studentPrintCost,
                    access: postStudentAccess
                };
            }
            let postURL = "";
            if (org.orgID !== 'libretexts' && import.meta.env.VITE_ADOPTIONREPORT_URL) {
              postURL = import.meta.env.VITE_ADOPTIONREPORT_URL;
            } else {
              postURL = '/adoptionreport';
            }
            axios.post(postURL, formData).then((res) => {
                if (!res.data.err) {
                    setShowSuccessModal(true);
                } else {
                    handleGlobalError(res.data.errMsg);
                }
            }).catch((err) => {
                handleGlobalError(err);
            });
        }
        setSubmitLoading(false);
    };


    /**
     * Called when the Succes Modal
     * is closed. Redirects user
     * to home page.
     */
    const successModalClosed = () => {
        setShowSuccessModal(false);
        props.history.push('/');
    };


    return (
        <Grid centered={true} verticalAlign='middle' className='component-container'>
            <Grid.Row>
                <Grid.Column>
                    <Grid verticalAlign='middle' centered={true}>
                        <Grid.Row>
                            <Grid.Column>
                                <Image
                                    src="/transparent_logo.png"
                                    size='medium'
                                    centered
                                    className='cursor-pointer'
                                    onClick={() => {
                                        window.open('https://libretexts.org', '_blank', 'noopener');
                                    }}
                                />
                                <Header as='h1' textAlign='center'>Adoption Report</Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column mobile={16} computer={10}>
                    <Segment raised className='mb-4r'>
                        <p>If you are an instructor or student using LibreTexts in your class, it would help us greatly if you would fill out this form.</p>
                        <Form noValidate>
                            <Form.Group widths='equal'>
                                <Form.Field
                                    required
                                    error={emailErr}
                                >
                                    <label htmlFor='ar-email-input'>Your Email</label>
                                    <Input
                                        fluid
                                        id='ar-email-input'
                                        type='email'
                                        name='email'
                                        placeholder='Email...'
                                        required
                                        icon='mail'
                                        iconPosition='left'
                                        onChange={handleInputChange}
                                        value={email}
                                    />
                                </Form.Field>
                                <Form.Field
                                    required
                                    error={nameErr}
                                >
                                    <label htmlFor='ar-name-input'>Your Name</label>
                                    <Input
                                        fluid
                                        id='ar-name-input'
                                        type='text'
                                        name='name'
                                        placeholder='Name...'
                                        required
                                        icon='user'
                                        iconPosition='left'
                                        onChange={handleInputChange}
                                        value={name}

                                    />
                                </Form.Field>
                            </Form.Group>
                            <Form.Select
                                fluid
                                label='I am a(n)'
                                options={iAmOptions}
                                placeholder='Choose...'
                                onChange={(e, { value }) => { setIAm(value) }}
                                value={iAm}
                                required
                                error={iAmErr}
                            />
                            {(iAm === 'instructor') &&
                                <div>
                                    <Divider />
                                    <Header as='h3'>Instructor</Header>
                                    <p>If you are using LibreTexts in your class(es), please help us by providing some additional data.</p>
                                    <Form.Group grouped required>
                                        <label className='form-required'>Is your Institution part of the LibreNet consortium?</label>
                                        <Form.Radio
                                            label='Yes'
                                            value='yes'
                                            onChange={handleLibreNetInstChange}
                                            checked={libreNetInst === 'yes'}
                                            error={libreNetInstErr}
                                        />
                                        <Form.Radio
                                            label='No'
                                            value='no'
                                            onChange={handleLibreNetInstChange}
                                            checked={libreNetInst === 'no'}
                                            error={libreNetInstErr}
                                        />
                                        <Form.Radio
                                            label="Don't Know"
                                            value='dk'
                                            onChange={handleLibreNetInstChange}
                                            checked={libreNetInst === 'dk'}
                                            error={libreNetInstErr}
                                        />
                                    </Form.Group>
                                    {((libreNetInst === 'yes') || (libreNetInst === 'dk')) &&
                                        <Form.Select
                                            fluid
                                            label='Institution Name'
                                            options={libreNetOptions}
                                            placeholder='Choose...'
                                            onChange={(e, { value }) => { setInstrInstName(value) }}
                                            value={instrInstName}
                                            required
                                            error={instrInstNameErr}
                                        />
                                    }
                                    {(libreNetInst === 'no') &&
                                        <Form.Field
                                            required
                                            error={instrInstNameErr}
                                        >
                                            <label htmlFor='ar-not-libre-inst-input'>Institution Name</label>
                                            <Input
                                                fluid
                                                id='ar-not-libre-inst-input'
                                                type='text'
                                                name='not-libre-inst'
                                                placeholder='Institution...'
                                                icon='university'
                                                iconPosition='left'
                                                onChange={handleInputChange}
                                                value={instrInstName}
                                            />
                                        </Form.Field>
                                    }
                                    <Form.Field
                                        required
                                        error={instrClassNameErr}
                                    >
                                        <label htmlFor='ar-instr-class-input'>Class Name</label>
                                        <Input
                                            fluid
                                            id='ar-instr-class-input'
                                            type='text'
                                            name='instr-class'
                                            placeholder='Class...'
                                            icon='pencil'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={instrClassName}
                                        />
                                    </Form.Field>
                                    <p className='mb-2p'><em>If you have tought this class multiple times, please fill out this form for each.</em></p>
                                    <Form.Select
                                        fluid
                                        label='When did you teach this class?'
                                        options={instrTaughtOptions}
                                        placeholder='Choose...'
                                        onChange={(e, { value }) => { setInstrTaughtTerm(value) }}
                                        value={instrTaughtTerm}
                                        required
                                        error={instrTaughtTermErr}
                                    />
                                    <Form.Field
                                        required
                                        error={instrNumStudentsErr}
                                    >
                                        <label htmlFor='ar-instr-num-students-input'>Number of Students</label>
                                        <Input
                                            fluid
                                            id='ar-instr-num-students-input'
                                            type='number'
                                            min={0}
                                            name='instr-num-students'
                                            placeholder='Number...'
                                            icon='users'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={instrNumStudents}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor='ar-instr-resource-url'>Link to adopted LibreTexts resource</label>
                                        <Input
                                            fluid
                                            id='ar-instr-resource-url'
                                            type='url'
                                            name='instr-resource-url'
                                            placeholder='URL...'
                                            icon='linkify'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={instrResourceURL}
                                        />
                                    </Form.Field>
                                    <Form.Select
                                        fluid
                                        label='LibreTexts Library'
                                        options={libraryOptions}
                                        placeholder='Choose...'
                                        onChange={(_e, { value }) => { setInstrResourceLib(value) }}
                                        value={instrResourceLib}
                                        required
                                        error={instrResLibErr}
                                    />
                                    <p className='mb-2p'><em>If you used more than one LibreTexts resource for your class please put the main text here and add additional links in the comment section before submission.</em></p>
                                    <Form.Field>
                                        <label htmlFor='ar-instr-replace-cost-input'>Cost of textbook that LibreTexts replaced</label>
                                        <Input
                                            fluid
                                            id='ar-instr-replace-cost-input'
                                            type='number'
                                            name='instr-replace-cost'
                                            placeholder='Cost...'
                                            icon='dollar'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={instrReplaceCost}
                                        />
                                    </Form.Field>
                                    <Form.Group grouped>
                                        <label>In which ways did students use LibreTexts in your class? (Select all that apply)</label>
                                        <Checkbox
                                            label='Online'
                                            className='ar-checkbox'
                                            checked={instrStudentAccess[0]}
                                            onChange={() => { handleInstrStudentAccessChange(0) }}
                                        />
                                        <Checkbox
                                            label='Printed Book'
                                            className='ar-checkbox'
                                            checked={instrStudentAccess[1]}
                                            onChange={() => { handleInstrStudentAccessChange(1) }}
                                        />
                                        <Checkbox
                                            label='Downloaded PDF'
                                            className='ar-checkbox'
                                            checked={instrStudentAccess[2]}
                                            onChange={() => { handleInstrStudentAccessChange(2) }}
                                        />
                                        <Checkbox
                                            label='Via LMS'
                                            className='ar-checkbox'
                                            checked={instrStudentAccess[3]}
                                            onChange={() => { handleInstrStudentAccessChange(3) }}
                                        />
                                        <Checkbox
                                            label='LibreTexts in a Box'
                                            className='ar-checkbox'
                                            checked={instrStudentAccess[4]}
                                            onChange={() => { handleInstrStudentAccessChange(4) }}
                                        />
                                    </Form.Group>
                                    <Form.Field>
                                        <label htmlFor='ar-instr-print-cost-input'>If you used a printed version of a LibreText, how much did it cost?</label>
                                        <Input
                                            fluid
                                            id='ar-instr-print-cost-input'
                                            type='number'
                                            name='instr-print-cost'
                                            placeholder='Cost...'
                                            icon='book'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={instrPrintCost}
                                        />
                                    </Form.Field>
                                </div>
                            }
                            {(iAm === 'student') &&
                                <div>
                                    <Divider />
                                    <Header as='h3'>Student</Header>
                                    <p>We are happy to hear that you are using LibreTexts in your classes.</p>
                                    <Form.Select
                                        fluid
                                        label='How is LibreTexts used in your class?'
                                        options={studentUseOptions}
                                        placeholder='Choose...'
                                        onChange={(e, { value }) => { setStudentUse(value) }}
                                        value={studentUse}
                                    />
                                    <Form.Field>
                                        <label htmlFor='ar-student-inst-input'>Institution Name</label>
                                        <Input
                                            fluid
                                            id='ar-student-inst-input'
                                            type='text'
                                            name='student-inst'
                                            placeholder='Institution...'
                                            icon='university'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={studentInst}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor='ar-student-class-input'>Class Name</label>
                                        <Input
                                            fluid
                                            id='ar-student-class-input'
                                            type='text'
                                            name='student-class'
                                            placeholder='Class...'
                                            icon='pencil'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={studentClass}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label htmlFor='ar-student-instructor-input'>Instructor Name</label>
                                        <Input
                                            fluid
                                            id='ar-student-instructor-input'
                                            type='text'
                                            name='student-instructor'
                                            placeholder='Instructor...'
                                            icon='user circle outline'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={studentInstr}
                                        />
                                    </Form.Field>
                                    <Form.Group grouped>
                                        <label>On a scale from 1 to 5, what is the quality of the LibreTexts content?</label>
                                        <Form.Radio
                                            label='1 (Very low)'
                                            value={1}
                                            onChange={handleStudentQualityChange}
                                            checked={studentQuality === 1}
                                        />
                                        <Form.Radio
                                            label='2'
                                            value={2}
                                            onChange={handleStudentQualityChange}
                                            checked={studentQuality === 2}
                                        />
                                        <Form.Radio
                                            label='3'
                                            value={3}
                                            onChange={handleStudentQualityChange}
                                            checked={studentQuality === 3}
                                        />
                                        <Form.Radio
                                            label='4'
                                            value={4}
                                            onChange={handleStudentQualityChange}
                                            checked={studentQuality === 4}
                                        />
                                        <Form.Radio
                                            label='5 (Very high)'
                                            value={5}
                                            onChange={handleStudentQualityChange}
                                            checked={studentQuality === 5}
                                        />
                                    </Form.Group>
                                    <Form.Group grouped>
                                        <label>On a scale from 1 to 5, how easy is it to navigate the LibreTexts site?</label>
                                        <Form.Radio
                                            label='1 (Very hard)'
                                            value={1}
                                            onChange={handleStudentNavigateChange}
                                            checked={studentNavigate === 1}
                                        />
                                        <Form.Radio
                                            label='2'
                                            value={2}
                                            onChange={handleStudentNavigateChange}
                                            checked={studentNavigate === 2}
                                        />
                                        <Form.Radio
                                            label='3'
                                            value={3}
                                            onChange={handleStudentNavigateChange}
                                            checked={studentNavigate === 3}
                                        />
                                        <Form.Radio
                                            label='4'
                                            value={4}
                                            onChange={handleStudentNavigateChange}
                                            checked={studentNavigate === 4}
                                        />
                                        <Form.Radio
                                            label='5 (Very easy)'
                                            value={5}
                                            onChange={handleStudentNavigateChange}
                                            checked={studentNavigate === 5}
                                        />
                                    </Form.Group>
                                    <Form.Group grouped>
                                        <label>How did you access LibreTexts? (Select all that apply)</label>
                                        <Checkbox
                                            label='Online'
                                            className='ar-checkbox'
                                            checked={studentAccess[0]}
                                            onChange={() => { handleStudentAccessChange(0) }}
                                        />
                                        <Checkbox
                                            label='Printed Book'
                                            className='ar-checkbox'
                                            checked={studentAccess[1]}
                                            onChange={() => { handleStudentAccessChange(1) }}
                                        />
                                        <Checkbox
                                            label='Downloaded PDF'
                                            className='ar-checkbox'
                                            checked={studentAccess[2]}
                                            onChange={() => { handleStudentAccessChange(2) }}
                                        />
                                        <Checkbox
                                            label='Via LMS'
                                            className='ar-checkbox'
                                            checked={studentAccess[3]}
                                            onChange={() => { handleStudentAccessChange(3) }}
                                        />
                                        <Checkbox
                                            label='LibreTexts in a Box'
                                            className='ar-checkbox'
                                            checked={studentAccess[4]}
                                            onChange={() => { handleStudentAccessChange(4) }}
                                        />
                                    </Form.Group>
                                    <Form.Field>
                                        <label htmlFor='ar-student-print-cost-input'>If you used a printed version of a LibreText, how much did it cost?</label>
                                        <Input
                                            fluid
                                            id='ar-student-print-cost-input'
                                            type='number'
                                            name='student-print-cost'
                                            placeholder='Cost...'
                                            icon='book'
                                            iconPosition='left'
                                            onChange={handleInputChange}
                                            value={studentPrintCost}
                                        />
                                    </Form.Field>
                                </div>
                            }
                            <Divider />
                            <Form.Field>
                                <label htmlFor='ar-addtl-comments-input'>If you have additional comments, please share below</label>
                                <Input
                                    fluid
                                    id='ar-addtl-comments-input'
                                    type='text'
                                    name='addtl-comments'
                                    placeholder='Comments...'
                                    icon='comment'
                                    iconPosition='left'
                                    onChange={handleInputChange}
                                    value={comments}
                                />
                            </Form.Field>
                            <Button
                                onClick={submitReport}
                                loading={submitLoading}
                                color='green'
                                fluid
                            >
                                <Icon name='check' />
                                Submit
                            </Button>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Modal
                onClose={successModalClosed}
                open={showSuccessModal}
            >
                <Modal.Header>Adoption Report: Success</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <p>Thank you for submitting an Adoption Report! You will now be redirected to the main page.</p>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button color="blue" onClick={successModalClosed}>Okay</Button>
                </Modal.Actions>
            </Modal>
        </Grid>
    )
}

export default AdoptionReportPage;
