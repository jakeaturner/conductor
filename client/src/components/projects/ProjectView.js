import './Projects.css'
import 'react-circular-progressbar/dist/styles.css';

import {
  Grid,
  Header,
  Segment,
  Divider,
  Message,
  Icon,
  Button,
  Form,
  Breadcrumb,
  Modal,
  Label,
  List,
  Image,
  Accordion,
  Comment,
  Input,
  Loader,
  Search,
  Card,
  Popup
} from 'semantic-ui-react';
import {
    CircularProgressbar,
    buildStyles
} from 'react-circular-progressbar';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import date from 'date-and-time';
import ordinal from 'date-and-time/plugin/ordinal';
import day_of_week from 'date-and-time/plugin/day-of-week';
import axios from 'axios';
import queryString from 'query-string';
import DOMPurify from 'dompurify';
import marked from 'marked';

import ConductorTextArea from '../util/ConductorTextArea';
import ConductorMessagingUI from '../util/ConductorMessagingUI';
import { MentionsInput, Mention } from 'react-mentions'

import {
    isEmptyString,
    capitalizeFirstLetter,
    normalizeURL,
    truncateString
} from '../util/HelperFunctions.js';
import {
    libraryOptions,
    getLibraryName
} from '../util/LibraryOptions.js';
import {
    visibilityOptions,
    editStatusOptions,
    createTaskOptions,
    classificationOptions,
    getTaskStatusText,
    getClassificationText,
    getRoadmapStepName
} from '../util/ProjectOptions.js';
import {
    licenseOptions,
    getLicenseText
} from '../util/LicenseOptions.js';

import useGlobalError from '../error/ErrorHooks.js';

const ProjectView = (props) => {

    // Global State and Eror Handling
    const { handleGlobalError } = useGlobalError();
    const user = useSelector((state) => state.user);

    // UI
    const [loadingData, setLoadingData] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [showProjectCreated, setShowProjectCreated] = useState(false);
    const [showDiscussion, setShowDiscussion] = useState(true);

    // Project Data
    const [project, setProject] = useState({});

    // Project Permissions
    const [canViewDetails, setCanViewDetails] = useState(false);

    // Edit Information Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalLoading, setEditModalLoading] = useState(false);
    const [projTitle, setProjTitle] = useState('');
    const [projStatus, setProjStatus] = useState('open');
    const [projClassification, setProjClassification] = useState('');
    const [projVisibility, setProjVisibility] = useState('private');
    const [projProgress, setProjProgress] = useState(0);
    const [projPRProgress, setProjPRProgress] = useState(0);
    const [projA11YProgress, setProjA11YProgress] = useState(0);
    const [projURL, setProjURL] = useState('');
    const [projTags, setProjTags] = useState([]);
    const [projLibreLibrary, setProjLibreLibrary] = useState('');
    const [projLibreCoverID, setProjLibreCoverID] = useState('');
    const [projResAuthor, setProjResAuthor] = useState('');
    const [projResEmail, setProjResEmail] = useState('');
    const [projResLicense, setProjResLicense] = useState('');
    const [projResURL, setProjResURL] = useState('');
    const [projNotes, setProjNotes] = useState('');
    const [projTitleErr, setProjTitleErr] = useState(false);
    const [projProgressErr, setProjProgressErr] = useState(false);
    const [projPRProgressErr, setProjPRProgressErr] = useState(false);
    const [projA11YProgressErr, setProjA11YProgressErr] = useState(false);
    const [tagOptions, setTagOptions] = useState([]);
    const [loadedTags, setLoadedTags] = useState(false);

    // Manage Collaborators Modal
    const [showCollabsModal, setShowCollabsModal] = useState(false);
    const [collabsUserOptions, setCollabsUserOptions] = useState([]);
    const [collabsUserOptsLoading, setCollabsUserOptsLoading] = useState(false);
    const [collabsUserToAdd, setCollabsUserToAdd] = useState('');
    const [collabsModalLoading, setCollabsModalLoading] = useState(false);

    // Delete Project Modal
    const [showDeleteProjModal, setShowDeleteProjModal] = useState(false);
    const [deleteProjModalLoading, setDeleteProjModalLoading] = useState(false);

    // Complete Project Modal
    const [showCompleteProjModal, setShowCompleteProjModal] = useState(false);
    const [completeProjModalLoading, setCompleteProjModalLoading] = useState(false);


    // Tasks
    const [openTaskDetails, setOpenTaskDetails] = useState([
        true, false, false, false, false
    ]);
    const [projTasks, setProjTasks] = useState([]);


    // Task Search
    const [taskSearchLoading, setTaskSearchLoading] = useState(false);
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [taskSearchResults, setTaskSearchResults] = useState([]);


    // Add Task Modal
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [addTaskLoading, setAddTaskLoading] = useState(false);
    const [addTaskTitle, setAddTaskTitle] = useState('');
    const [addTaskDescrip, setAddTaskDescrip] = useState('');
    const [addTaskStatus, setAddTaskStatus] = useState('available');
    const [addTaskDeps, setAddTaskDeps] = useState([]);
    const [addTaskDepOptions, setAddTaskDepOptions] = useState([]);
    const [addTaskAssigns, setAddTaskAssigns] = useState([]);
    const [addTaskAssignOptions, setAddTaskAssignOptions] = useState([]);
    const [addTaskTitleErr, setAddTaskTitleErr] = useState(false);


    // View Task Modal
    const [showViewTaskModal, setShowViewTaskModal] = useState(false);
    const [viewTaskData, setViewTaskData] = useState({});


    /**
     * Set page title and load Project information on initial load.
     */
    useEffect(() => {
        document.title = "LibreTexts Conductor | Projects | Project View";
        date.plugin(ordinal);
        date.plugin(day_of_week);
        // Hook to force message links to open in new window
        DOMPurify.addHook('afterSanitizeAttributes', function (node) {
          if ('target' in node) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer')
          }
        });
        getProject();
        if (localStorage.getItem('conductor_show_projectdiscussion') !== null) {
            if (localStorage.getItem('conductor_show_projectdiscussion') === 'true') {
                setShowDiscussion(true);
            }
        }
    }, []);


    /**
     * Read URL params and update UI accordingly.
     */
    useEffect(() => {
        const queryValues = queryString.parse(props.location.search);
        if (queryValues.projectCreated === 'true') {
            setShowProjectCreated(true);
        }
    }, [props.location.search]);


    /**
     * Update the page title to the project title when it is available.
     */
    useEffect(() => {
        if (projTitle !== '') {
            document.title = `LibreTexts Conductor | Projects | ${projTitle}`;
        }
    }, [projTitle]);


    /*
     * Update the user's permission to view Project restricted details when
     * their identity and the project data is available.
     */
    useEffect(() => {
        if (user.uuid && user.uuid !== '') {
            if (project.owner?.uuid === user.uuid || project.owner === user.uuid) {
                setCanViewDetails(true);
            } else {
                if (project.hasOwnProperty('collaborators') && Array.isArray(project.collaborators)) {
                    let foundCollab = project.collaborators.find((item) => {
                        if (typeof(item) === 'string') {
                            return item === user.uuid;
                        } else if (typeof(item) === 'object') {
                            return item.uuid === user.uuid;
                        }
                        return false;
                    });
                    if (foundCollab !== undefined) setCanViewDetails(true);
                }
            }
        }
    }, [project, user, setCanViewDetails]);


    /*
     * Get Project's restricted details when the permission changes.
     */
    useEffect(() => {
        if (canViewDetails) {
            //getProjectTasks();
        }
    }, [canViewDetails]);


    /**
     * Retrieves the Project information via GET request
     * to the server and saves it to state.
     */
    const getProject = () => {
        setLoadingData(true);
        axios.get('/project', {
            params: {
                projectID: props.match.params.id
            }
        }).then((res) => {
            if (!res.data.err) {
                if (res.data.project) {
                    setProject(res.data.project);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
            setLoadingData(false);
        }).catch((err) => {
            handleGlobalError(err);
            setLoadingData(false);
        });
    };


    const getProjectTasks = () => {
        setLoadingTasks(true);
        axios.get('/project/tasks', {
            params: {
                projectID: props.match.params.id
            }
        }).then((res) => {
            if (!res.data.err) {
                if (res.data.tasks && Array.isArray(res.data.tasks)) {
                    let newTasks = res.data.tasks.map((item) => {
                        return {
                            ...item,
                            uiOpen: false
                        }
                    });
                    setProjTasks(newTasks);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
            setLoadingTasks(false);
        }).catch((err) => {
            handleGlobalError(err);
            setLoadingTasks(false);
        });
    };


    /**
     * Opens the Edit Information Modal and retrieves existing tags,
     * then sets fields to their current respective values.
     */
    const openEditInfoModal = () => {
        setEditModalLoading(true);
        getTags();
        if (project.title) setProjTitle(project.title);
        if (project.status) setProjStatus(project.status);
        if (project.visibility) setProjVisibility(project.visibility);
        if (project.hasOwnProperty('currentProgress')) setProjProgress(project.currentProgress);
        if (project.hasOwnProperty('peerProgress')) setProjPRProgress(project.peerProgress);
        if (project.hasOwnProperty('a11yProgress')) setProjA11YProgress(project.a11yProgress);
        if (project.classification) setProjClassification(project.classification);
        if (project.projectURL) setProjURL(project.projectURL);
        if (project.tags) setProjTags(project.tags);
        if (project.libreLibrary) setProjLibreLibrary(project.libreLibrary);
        if (project.libreCoverID) setProjLibreCoverID(project.libreCoverID);
        if (project.author) setProjResAuthor(project.author);
        if (project.authorEmail) setProjResEmail(project.authorEmail);
        if (project.license) setProjResLicense(project.license);
        if (project.resourceURL) setProjResURL(project.resourceURL);
        if (project.notes) setProjNotes(project.notes);
        setEditModalLoading(false);
        setShowEditModal(true);
    };


    /**
     * Closes the Edit Information Modal and resets all
     * fields to their default values.
     */
    const closeEditInfoModal = () => {
        setShowEditModal(false);
        setEditModalLoading(false);
        setProjTitle('');
        setProjStatus('open');
        setProjVisibility('private');
        setProjProgress(0);
        setProjPRProgress(0);
        setProjA11YProgress(0);
        setProjClassification('');
        setProjURL('');
        setProjTags([]);
        setProjLibreLibrary('');
        setProjLibreCoverID('');
        setProjResAuthor('');
        setProjResEmail('');
        setProjResLicense('');
        setProjResURL('');
        setProjNotes('');
    };


    /**
     * Load existing Project Tags from the server
     * via GET request, then sort, format, and save
     * them to state for use in the Dropdown.
     */
    const getTags = () => {
        axios.get('/projects/tags/org').then((res) => {
            if (!res.data.err) {
                if (res.data.tags && Array.isArray(res.data.tags)) {
                    res.data.tags.sort((tagA, tagB) => {
                        var aNorm = String(tagA.title).toLowerCase();
                        var bNorm = String(tagB.title).toLowerCase();
                        if (aNorm < bNorm) return -1;
                        if (aNorm > bNorm) return 1;
                        return 0;
                    })
                    const newTagOptions = res.data.tags.map((tagItem) => {
                        return { text: tagItem.title, value: tagItem.title };
                    });
                    setTagOptions(newTagOptions);
                    setLoadedTags(true);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
        }).catch((err) => {
            handleGlobalError(err);
        });
    };


    /**
     * Resets all Edit Information form error states.
     */
    const resetEditInfoFormErrors = () => {
        setProjTitleErr(false);
        setProjProgressErr(false);
        setProjPRProgressErr(false);
        setProjA11YProgressErr(false);
    };


    /**
     * Validates the Edit Project Information form.
     * @returns {boolean} true if all fields are valid, false otherwise
     */
    const validateEditInfoForm = () => {
        var validForm = true;
        if (isEmptyString(projTitle)) {
            validForm = false;
            setProjTitleErr(true);
        }
        if ((projProgress < 0) || (projProgress > 100)) {
            validForm = false;
            setProjProgressErr(true);
        }
        if ((projPRProgress < 0) || (projPRProgress > 100)) {
            validForm = false;
            setProjPRProgressErr(true);
        }
        if ((projA11YProgress < 0) || (projA11YProgress > 100)) {
            validForm = false;
            setProjA11YProgressErr(true);
        }
        return validForm;
    };


    /**
     * Ensure the form data is valid, then submit the
     * data to the server via POST request. Re-syncs
     * Project information on success.
     */
    const submitEditInfoForm = () => {
        resetEditInfoFormErrors();
        if (validateEditInfoForm()) {
            setEditModalLoading(true);
            var projData = {
                projectID: props.match.params.id
            };
            if (project.tags) {
                var newTags = false;
                var originalPlainTags = [];
                if (project.tags) originalPlainTags = project.tags;
                // check if there are any new tags
                projTags.forEach((tag) => {
                    if (!originalPlainTags.includes(tag)) newTags = true;
                });
                // new tags are present or all tags were removed
                if (newTags || (originalPlainTags.length > 0 && projTags.length === 0)) projData.tags = projTags;
            } else {
                projData.tags = projTags;
            }
            if ((project.title && project.title !== projTitle) || !project.title) {
                projData.title = projTitle;
            }
            if ((project.hasOwnProperty('currentProgress') && project.currentProgress !== projProgress) || !project.hasOwnProperty('currentProgress')) {
                projData.progress = projProgress;
            }
            if ((project.hasOwnProperty('peerProgress') && project.peerProgress !== projPRProgress) || !project.hasOwnProperty('peerProgress')) {
                projData.peerProgress = projPRProgress;
            }
            if ((project.hasOwnProperty('a11yProgress') && project.a11yProgress !== projA11YProgress) || !project.hasOwnProperty('a11yProgress')) {
                projData.a11yProgress = projA11YProgress;
            }
            if ((project.classification && project.classification !== projClassification) || !project.classification) {
                projData.classification = projClassification;
            }
            if ((project.status && project.status !== projStatus) || !project.status) {
                projData.status = projStatus;
            }
            if ((project.visibility && project.visibility !== projVisibility) || !project.visibility) {
                projData.visibility = projVisibility;
            }
            if ((project.projectURL && project.projectURL !== projURL) || !project.projectURL) {
                projData.projectURL = projURL;
            }
            if ((project.libreLibrary && project.libreLibrary !== projLibreLibrary) || !project.libreLibrary) {
                projData.libreLibrary = projLibreLibrary;
            }
            if ((project.libreCoverID && project.libreCoverID !== projLibreCoverID) || !project.libreCoverID) {
                projData.libreCoverID = projLibreCoverID;
            }
            if ((project.author && project.author !== projResAuthor) || !project.author) {
                projData.author = projResAuthor;
            }
            if ((project.authorEmail && project.authorEmail !== projResEmail) || !project.authorEmail) {
                projData.authorEmail = projResEmail;
            }
            if ((project.license && project.license !== projResLicense) || !project.license) {
                projData.license = projResLicense;
            }
            if ((project.resourceURL && project.resourceURL !== projResURL) || !project.resourceURL) {
                projData.resourceURL = projResURL;
            }
            if ((project.notes && project.notes !== projNotes) || !project.notes) {
                projData.notes = projNotes;
            }
            if (Object.keys(projData).length > 1) {
                axios.put('/project', projData).then((res) => {
                    if (!res.data.err) {
                        closeEditInfoModal();
                        getProject();
                    } else {
                        handleGlobalError(res.data.errMsg);
                        setEditModalLoading(false);
                    }
                }).catch((err) => {
                    handleGlobalError(err);
                    setEditModalLoading(false);
                });
            } else {
                // no changes to save
                closeEditInfoModal();
            }
        }
    };


    /**
     * Retrieves a list of users that can be added as collaborators to the
     * project, then processes and sets them in state.
     */
    const getCollabsUserOptions = () => {
        setCollabsUserOptsLoading(true);
        axios.get('/project/collabs/addable', {
            params: {
                projectID: props.match.params.id
            }
        }).then((res) => {
            if (!res.data.err) {
                if (res.data.users && Array.isArray(res.data.users)) {
                    var newOptions = [];
                    res.data.users.forEach((item) => {
                        newOptions.push({
                            key: item.uuid,
                            text: `${item.firstName} ${item.lastName}`,
                            value: item.uuid,
                            image: {
                                avatar: true,
                                src: item.avatar
                            }
                        });
                    });
                    newOptions.sort((a, b) => {
                        var normalizedA = String(a.text).toLowerCase().replace(/[^a-zA-Z]/gm, '');
                        var normalizedB = String(b.text).toLowerCase().replace(/[^a-zA-Z]/gm, '');
                        if (normalizedA < normalizedB) {
                            return -1;
                        }
                        if (normalizedA > normalizedB) {
                            return 1;
                        }
                        return 0;
                    });
                    newOptions.unshift({ key: 'empty', text: 'Clear...', value: '' });
                    setCollabsUserOptions(newOptions);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
            setCollabsUserOptsLoading(false);
        }).catch((err) => {
            handleGlobalError(err);
            setCollabsUserOptsLoading(false);
        });
    };


    /**
     * Submits a PUT request to the server to add the user
     * in state (collabsUserToAdd) to the project's collaborators list,
     * then refreshes the project data and Addable Collaborators options.
     */
    const submitAddCollaborator = () => {
        if (!isEmptyString(collabsUserToAdd)) {
            setCollabsModalLoading(true);
            axios.put('/project/collabs/add', {
                projectID: props.match.params.id,
                uuid: collabsUserToAdd
            }).then((res) => {
                if (!res.data.err) {
                    setCollabsModalLoading(false);
                    getCollabsUserOptions();
                    getProject();
                    closeCollabsModal();
                } else {
                    handleGlobalError(res.data.errMsg);
                }
                setCollabsModalLoading(false);
            }).catch((err) => {
                handleGlobalError(err);
                setCollabsModalLoading(false);
            });
        }
    };


    /**
     * Submits a PUT request to the server to remove the specified user
     * from the project's collaborators list, then refreshes the
     * project data and Addable Collaborators options.
     * @param  {string} collabUUID  - the uuid of the user to remove
     */
    const submitRemoveCollaborator = (collabUUID) => {
        if (!isEmptyString(collabUUID)) {
            setCollabsModalLoading(true);
            axios.put('/project/collabs/remove', {
                projectID: props.match.params.id,
                uuid: collabUUID
            }).then((res) => {
                if (!res.data.err) {
                    setCollabsModalLoading(false);
                    getCollabsUserOptions();
                    getProject();
                    closeCollabsModal();
                } else {
                    handleGlobalError(res.data.errMsg);
                }
                setCollabsModalLoading(false);
            }).catch((err) => {
                handleGlobalError(err);
                setCollabsModalLoading(false);
            });
        }
    };


    /**
     * Opens the Manage Collaborators Modal and sets the fields to their
     * default values, then triggers the function to retrieve the list of
     * Addable Collaborators.
     */
    const openCollabsModal = () => {
        setCollabsModalLoading(false);
        setCollabsUserOptions([]);
        setCollabsUserToAdd('');
        getCollabsUserOptions();
        setShowCollabsModal(true);
    };


    /**
     * Closes the Manage Collaborators Modal and resets the fields
     * to their default values.
     */
    const closeCollabsModal = () => {
        setShowCollabsModal(false);
        setCollabsUserOptions([]);
        setCollabsUserToAdd('');
        setCollabsUserOptsLoading(false);
        setCollabsModalLoading(false);
    };


    /**
     * Submits a DELETE request to the server to delete the project,
     * then redirects to the Projects dashboard on success.
     */
    const submitDeleteProject = () => {
        setDeleteProjModalLoading(true);
        axios.delete('/project', {
            data: {
                projectID: props.match.params.id
            }
        }).then((res) => {
            setDeleteProjModalLoading(false);
            if (!res.data.err) {
                props.history.push('/projects?projectDeleted=true');
            } else {
                handleGlobalError(res.data.errMsg);
            }
        }).catch((err) => {
            handleGlobalError(err);
            setDeleteProjModalLoading(false);
        });
    };


    /**
     * Submits a PUT request to the server to mark the project as completed,
     * then closes the Complete Project modal and re-syncs the Project data.
     */
    const submitMarkCompleted = () => {
        setCompleteProjModalLoading(true);
        axios.put('/project/complete', {
            projectID: props.match.params.id
        }).then((res) => {
            if (!res.data.err) {
                getProject();
                setCompleteProjModalLoading(false);
                setShowCompleteProjModal(false);
                resetEditInfoFormErrors();
                closeEditInfoModal();
            } else {
                handleGlobalError(res.data.errMsg);
                setCompleteProjModalLoading(false);
            }
        }).catch((err) => {
            handleGlobalError(err);
            setCompleteProjModalLoading(false);
        });
    };


    const handleTaskSearch = (_e, { searchString }) => {
        setTaskSearchLoading(true);
        setTaskSearchQuery(searchString);
        let results = projTasks.filter((task) => {
            var descripString = String(task.title).toLowerCase() + String(task.description).toLowerCase();
            if (searchString !== '' && String(descripString).indexOf(String(searchString).toLowerCase()) === -1) {
                return task;
            } else {
                return false;
            }
        }).map((item) => {
            return {
                taskID: item.taskID,
                title: item.title,
                description: item.description
            }
        });
        setTaskSearchResults(results);
        setTaskSearchLoading(false);
    };


    const toggleTaskDetail = (id) => {
        const updatedTasks = projTasks.map((item) => {
            if (id === item.taskID) {
                return {
                    ...item,
                    uiOpen: !item.uiOpen
                }
            } else return item;
        });
        setProjTasks(updatedTasks);
    };


    const expandCollapseAllTasks = () => {
        let updatedTasks = [];
        const foundOpen = projTasks.find((item) => {
            return (item.uiOpen === true);
        });
        if (foundOpen !== undefined) { // one is open, close them all
            updatedTasks = projTasks.map((item) => {
                return {
                    ...item,
                    uiOpen: false
                }
            });
        } else { // all are closed, open them all
            updatedTasks = projTasks.map((item) => {
                return {
                    ...item,
                    uiOpen: true
                }
            });
        }
        setProjTasks(updatedTasks);
    };


    const openAddTaskModal = () => {
        if (project.hasOwnProperty('collaborators') && Array.isArray(project.collaborators)) {
            let assignOptions = project.collaborators.map((item) => {
                var newOption = {
                    key: '',
                    text: 'Unknown User',
                    value: '',
                    image: {
                        avatar: true,
                        src: '/mini_logo.png'
                    }
                };
                if (item.hasOwnProperty('uuid')) {
                    newOption.key = item.uuid;
                    newOption.value = item.uuid;
                    if (item.hasOwnProperty('firstName') && item.hasOwnProperty('lastName')) {
                        newOption.text = item.firstName + ' ' + item.lastName;
                    }
                    if (item.hasOwnProperty('avatar') && item.avatar !== '') {
                        newOption.image = {
                            avatar: true,
                            src: item.avatar
                        };
                    }
                    return newOption;
                } else {
                    return null;
                }
            }).filter(item => item !== null);
            setAddTaskAssignOptions(assignOptions);
        } else {
            setAddTaskAssignOptions([]);
        }
        if (projTasks.length > 0) {
            let depOptions = projTasks.map((item) => {
                var newOption = {
                    key: '',
                    text: 'Unknown Task',
                    value: ''
                };
                if (item.hasOwnProperty('taskID')) {
                    newOption.key = item.taskID;
                    newOption.value = item.taskID;
                    if (item.hasOwnProperty('title') && item.title !== '') {
                        newOption.text = item.title;
                    }
                    return newOption;
                } else {
                    return null;
                }
            }).filter(item => item !== null);
            setAddTaskDepOptions(depOptions);
        } else {
            setAddTaskDepOptions([]);
        }
        setAddTaskLoading(false);
        setAddTaskTitle('');
        setAddTaskDescrip('');
        setAddTaskStatus('available');
        setAddTaskDeps([]);
        setAddTaskAssigns([]);
        setAddTaskTitleErr(false);
        setShowAddTaskModal(true);
    };


    const closeAddTaskModal = () => {
        setShowAddTaskModal(false);
        setAddTaskLoading(false);
        setAddTaskTitle('');
        setAddTaskDescrip('');
        setAddTaskStatus('available');
        setAddTaskDeps([]);
        setAddTaskDepOptions([]);
        setAddTaskAssigns([]);
        setAddTaskAssignOptions([]);
        setAddTaskTitleErr(false);
    };


    const submitAddTask = () => {
        setAddTaskTitleErr(false);
        if (!isEmptyString(addTaskTitle)) {
            setAddTaskLoading(true);
            let taskData = {
                projectID: props.match.params.id,
                title: addTaskTitle,
                status: addTaskStatus
            };
            if (!isEmptyString(addTaskDescrip)) taskData.description = addTaskDescrip;
            if (addTaskAssigns.length > 0) taskData.assignees = addTaskAssigns;
            if (addTaskDeps.length > 0) taskData.dependencies = addTaskDeps;
            axios.post('/project/task', taskData).then((res) => {
                if (!res.data.err) {
                    closeAddTaskModal();
                } else {
                    handleGlobalError(res.data.errMsg);
                    setAddTaskLoading(false);
                }
            }).catch((err) => {
                handleGlobalError(err);
                setAddTaskLoading(false);
            });
        } else {
            setAddTaskTitleErr(true);
        }
    };


    const openViewTaskModal = (taskID) => {
        let foundTask = projTasks.find((item) => item.taskID === taskID);
        if (foundTask !== undefined) {
            setViewTaskData(foundTask);
            setShowViewTaskModal(true);
        }
    };


    const closeViewTaskModal = () => {
        setShowViewTaskModal(false);
        setViewTaskData({});
    };

    const handleChangeDiscussionVis = () => {
        setShowDiscussion(!showDiscussion);
        localStorage.setItem('conductor_show_projectdiscussion', !showDiscussion);
    };


    // Rendering Helper Booleans
    let hasResourceInfo = project.author || project.license || project.resourceURL;
    let hasNotes = project.notes && !isEmptyString(project.notes);
    let hasCollabs = project.collaborators && Array.isArray(project.collaborators) && project.collaborators.length > 0;


    return(
        <Grid className='component-container'>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Header className='component-header'>Project: <em>{project.title || 'Loading...'}</em></Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Segment.Group>
                        <Segment>
                            <Breadcrumb>
                                <Breadcrumb.Section as={Link} to='/projects'>
                                    Projects
                                </Breadcrumb.Section>
                                <Breadcrumb.Divider icon='right chevron' />
                                {(project.status === 'available') &&
                                    <Breadcrumb.Section as={Link} to='/projects/available'>
                                        Available Projects
                                    </Breadcrumb.Section>
                                }
                                {(project.status === 'completed') &&
                                    <Breadcrumb.Section as={Link} to='/projects/completed'>
                                        Completed Projects
                                    </Breadcrumb.Section>
                                }
                                {(project.status === 'available' || project.status === 'completed') &&
                                    <Breadcrumb.Divider icon='right chevron' />
                                }
                                <Breadcrumb.Section active>
                                    {project.title || 'Loading...'}
                                </Breadcrumb.Section>
                            </Breadcrumb>
                            <div className='float-right'>
                                <span className='muted-text'>ID: {project.projectID || 'Loading...'}</span>
                            </div>
                        </Segment>
                        <Segment loading={loadingData}>
                            <Grid padded='horizontally' relaxed>
                                {showProjectCreated &&
                                    <Grid.Row>
                                        <Grid.Column width={16}>
                                            <Message floating icon success>
                                                <Icon name='check' />
                                                <Message.Content>
                                                    <Message.Header>Project successfully created!</Message.Header>
                                                </Message.Content>
                                            </Message>
                                        </Grid.Column>
                                    </Grid.Row>
                                }
                                <Grid.Row>
                                    <Grid.Column>
                                        <Button.Group fluid>
                                            <Button
                                                color='blue'
                                                loading={editModalLoading}
                                                onClick={openEditInfoModal}
                                            >
                                                <Icon name='edit' />
                                                Edit Properties
                                            </Button>
                                            <Button
                                                color='violet'
                                                onClick={openCollabsModal}
                                            >
                                                <Icon name='users' />
                                                Manage Team
                                            </Button>
                                            <Button
                                                color='olive'
                                                as={Link}
                                                to={`${props.match.url}/timeline`}
                                            >
                                                <Icon name='clock outline' />
                                                Timeline
                                            </Button>
                                            <Button
                                                color='orange'
                                                as={Link}
                                                to={`${props.match.url}/peerreview`}
                                            >
                                                <Icon name='clipboard outline' />
                                                Peer Review
                                            </Button>
                                            <Button
                                                color='teal'
                                                as={Link}
                                                to={`${props.match.url}/accessibility`}
                                            >
                                                <Icon name='universal access' />
                                                Accessibility
                                            </Button>
                                        </Button.Group>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row className='mb-2p'>
                                    <Grid.Column>
                                        <Header as='h2' dividing>Project Information</Header>
                                        <Grid>
                                            <Grid.Row centered>
                                                <Grid.Column width={4} className='project-progress-column'>
                                                    <p className='text-center'><strong>Project</strong></p>
                                                    <CircularProgressbar
                                                        value={project.currentProgress || 0}
                                                        text={`${project.currentProgress || 0}%`}
                                                        strokeWidth={5}
                                                        circleRatio={0.75}
                                                        styles={buildStyles({
                                                            rotation: 1 / 2 + 1 / 8,
                                                            pathColor: '#127BC4',
                                                            textColor: '#127BC4',
                                                            strokeLinecap: 'butt'
                                                        })}
                                                    />
                                                </Grid.Column>
                                                <Grid.Column width={4} className='project-progress-column'>
                                                    <p className='text-center'><strong>Peer Review</strong></p>
                                                    <CircularProgressbar
                                                        value={project.peerProgress || 0}
                                                        text={`${project.peerProgress || 0}%`}
                                                        strokeWidth={5}
                                                        circleRatio={0.75}
                                                        styles={buildStyles({
                                                            rotation: 1 / 2 + 1 / 8,
                                                            pathColor: '#f2711c',
                                                            textColor: '#f2711c',
                                                            strokeLinecap: 'butt'
                                                        })}
                                                    />
                                                </Grid.Column>
                                                <Grid.Column width={4} className='project-progress-column'>
                                                    <p className='text-center'><strong>Accessibility</strong></p>
                                                    <CircularProgressbar
                                                        value={project.a11yProgress || 0}
                                                        text={`${project.a11yProgress || 0}%`}
                                                        strokeWidth={5}
                                                        circleRatio={0.75}
                                                        styles={buildStyles({
                                                            rotation: 1 / 2 + 1 / 8,
                                                            pathColor: '#00b5ad',
                                                            textColor: '#00b5ad',
                                                            strokeLinecap: 'butt'
                                                        })}
                                                    />
                                                </Grid.Column>
                                            </Grid.Row>
                                            <Grid.Row columns='equal'>
                                                <Grid.Column>
                                                    <Header as='h3' dividing>Overview</Header>
                                                    <div className='mb-1p'>
                                                        <Header as='span' sub>Status: </Header>
                                                        <span>{project.status ? capitalizeFirstLetter(project.status) : 'Loading...'}</span>
                                                    </div>
                                                    <div className='mb-1p'>
                                                        <Header as='span' sub>Visibility: </Header>
                                                        <span>{project.visibility ? capitalizeFirstLetter(project.visibility) : 'Loading...'}</span>
                                                    </div>
                                                    {(project.classification && !isEmptyString(project.classification)) &&
                                                        <div className='mb-1p'>
                                                            <Header as='span' sub>Classification: </Header>
                                                            <span>{getClassificationText(project.classification)}</span>
                                                        </div>
                                                    }
                                                    {(project.rdmpCurrentStep && !isEmptyString(project.rdmpCurrentStep)) &&
                                                        <div className='mb-1p'>
                                                            <Header as='span' sub>Construction Step: </Header>
                                                            <span><em>{getRoadmapStepName(project.rdmpCurrentStep)}</em></span>
                                                        </div>
                                                    }
                                                    {(project.projectURL && !isEmptyString(project.projectURL)) &&
                                                        <div className='mb-1p'>
                                                            <Header as='span' sub>URL: </Header>
                                                            <a href={normalizeURL(project.projectURL)} target='_blank' rel='noopener noreferrer'>{truncateString(project.projectURL, 100)}</a>
                                                        </div>
                                                    }
                                                    {(project.libreLibrary && !isEmptyString(project.libreLibrary)) &&
                                                        <div className='mb-1p'>
                                                            <Header as='span' sub>Library: </Header>
                                                            {(project.libreCoverID && !isEmptyString(project.libreCoverID))
                                                                ?   <a
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        href={`https://${project.libreLibrary}.libretexts.org/@go/page/${project.libreCoverID}`}
                                                                        className='mr-1r'
                                                                    >
                                                                        {getLibraryName(project.libreLibrary)}
                                                                        <Icon name='external' className='ml-1p'/>
                                                                    </a>
                                                                : <span>{getLibraryName(project.libreLibrary)}</span>
                                                            }
                                                        </div>
                                                    }
                                                    {(project.tags && Array.isArray(project.tags) && project.tags.length > 0) &&
                                                        <div>
                                                            <Header as='span' sub>Tags: </Header>
                                                            <Label.Group color='blue' className='inlineblock-display ml-1p'>
                                                                {project.tags.map((tag, idx) => {
                                                                    return (
                                                                        <Label key={idx}>{tag}</Label>
                                                                    )
                                                                })}
                                                            </Label.Group>
                                                        </div>
                                                    }
                                                </Grid.Column>
                                                {hasResourceInfo &&
                                                    <Grid.Column>
                                                        <Header as='h3' dividing>Resource</Header>
                                                        {(project.author && !isEmptyString(project.author)) &&
                                                            <div className='mb-1p'>
                                                                <Header as='span' sub>Author: </Header>
                                                                <span>{project.author}</span>
                                                            </div>
                                                        }
                                                        {(project.authorEmail && !isEmptyString(project.authorEmail)) &&
                                                            <div className='mt-1p mb-1p'>
                                                                <Header as='span' sub>Author Email: </Header>
                                                                <a href={`mailto:${project.authorEmail}`} target='_blank' rel='noopener noreferrer'>{project.authorEmail}</a>
                                                            </div>
                                                        }
                                                        {(project.license && !isEmptyString(project.license)) &&
                                                            <div className='mt-1p mb-1p'>
                                                                <Header as='span' sub>License: </Header>
                                                                <span>{getLicenseText(project.license)}</span>
                                                            </div>
                                                        }
                                                        {(project.resourceURL && !isEmptyString(project.resourceURL)) &&
                                                            <div className='mt-1p'>
                                                                <Header as='span' sub>URL: </Header>
                                                                <a href={normalizeURL(project.resourceURL)} target='_blank' rel='noopener noreferrer'>{project.resourceURL}</a>
                                                            </div>
                                                        }
                                                    </Grid.Column>
                                                }
                                            </Grid.Row>
                                            <Grid.Row columns='equal'>
                                                {hasNotes &&
                                                    <Grid.Column>
                                                        <Header as='h3' dividing>Notes</Header>
                                                        <p dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(marked(project.notes, { breaks: true }))
                                                        }}></p>
                                                    </Grid.Column>
                                                }
                                                <Grid.Column>
                                                    <Header as='h3' dividing>Team</Header>
                                                    <List divided verticalAlign='middle'>
                                                        <List.Item key={project.owner?.uuid || 'owner'}>
                                                            <Image avatar src={project.owner?.avatar || '/mini_logo.png'} />
                                                            <List.Content>
                                                                {project.owner?.firstName} {project.owner?.lastName} (<em>Lead</em>)
                                                            </List.Content>
                                                        </List.Item>
                                                        {(hasCollabs && project.collaborators.map((item, idx) => {
                                                            return (
                                                                <List.Item key={idx}>
                                                                    <Image avatar src={item.avatar} />
                                                                    <List.Content>{item.firstName} {item.lastName}</List.Content>
                                                                </List.Item>
                                                            )
                                                        }))}
                                                    </List>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    {(canViewDetails && showDiscussion) &&
                                        <Grid.Column>
                                            <Header as='h2' dividing>
                                                Discussion
                                                <Button
                                                    compact
                                                    floated='right'
                                                    onClick={handleChangeDiscussionVis}
                                                >
                                                    Hide
                                                </Button>
                                            </Header>
                                            <Segment
                                                size='large'
                                                raised
                                                className='project-discussion-segment mb-2p'
                                            >
                                                <ConductorMessagingUI
                                                    projectID={props.match.params.id}
                                                    user={user}
                                                    kind='project'
                                                />
                                            </Segment>
                                        </Grid.Column>
                                    }
                                    {(canViewDetails && !showDiscussion) &&
                                        <Grid.Column>
                                            <Segment
                                                raised
                                                clearing
                                            >
                                                <Header as='h2' className='project-hiddensection-heading'>Discussion</Header>
                                                <Button
                                                    floated='right'
                                                    onClick={handleChangeDiscussionVis}
                                                >
                                                    Show
                                                </Button>
                                            </Segment>
                                        </Grid.Column>
                                    }
                                    {!canViewDetails &&
                                        <Grid.Column>
                                            <Header as='h2' dividing>Discussion</Header>
                                            <Segment
                                                size='large'
                                                raised
                                                className='mb-2p'
                                            >
                                                <p><em>You don't have permission to view this project's Discussion yet.</em></p>
                                            </Segment>
                                        </Grid.Column>
                                    }
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Header as='h2' dividing>Tasks</Header>
                                        <Segment
                                            size='large'
                                            raised
                                            className='mb-2p'
                                        >
                                            <p><em>This area has been temporarily disabled during construction.</em></p>
                                        </Segment>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    </Segment.Group>
                    {/* Edit Project Information Modal */}
                    <Modal
                        open={showEditModal}
                        closeOnDimmerClick={false}
                        size='large'
                    >
                        <Modal.Header>Edit Project Properties</Modal.Header>
                        <Modal.Content scrolling>
                            <Button
                                color='green'
                                onClick={() => setShowCompleteProjModal(true)}
                                fluid
                                className='mb-2p'
                            >
                                <Icon name='check' />
                                Complete Project
                            </Button>
                            <Form noValidate>
                                <Header as='h3'>Project Overview</Header>
                                <Form.Field
                                    required
                                    error={projTitleErr}
                                >
                                    <label>Project Title</label>
                                    <Form.Input
                                        type='text'
                                        placeholder='Enter the project title...'
                                        onChange={(e) => setProjTitle(e.target.value)}
                                        value={projTitle}
                                    />
                                </Form.Field>
                                <Form.Field
                                    error={projProgressErr}
                                >
                                    <label>Current Progress</label>
                                    <Form.Input
                                        name='currentProgress'
                                        type='number'
                                        placeholder='Enter current estimated progress...'
                                        min='0'
                                        max='100'
                                        onChange={(e) => setProjProgress(e.target.value)}
                                        value={projProgress}
                                    />
                                </Form.Field>
                                <Form.Field
                                    error={projPRProgressErr}
                                >
                                    <label>Peer Review Progress</label>
                                    <Form.Input
                                        name='peerreviewprogress'
                                        type='number'
                                        placeholder='Enter current estimated progress...'
                                        min='0'
                                        max='100'
                                        onChange={(e) => setProjPRProgress(e.target.value)}
                                        value={projPRProgress}
                                    />
                                </Form.Field>
                                <Form.Field
                                    error={projA11YProgressErr}
                                >
                                    <label>Accessibility Progress</label>
                                    <Form.Input
                                        name='a11yprogress'
                                        type='number'
                                        placeholder='Enter current estimated progress...'
                                        min='0'
                                        max='100'
                                        onChange={(e) => setProjA11YProgress(e.target.value)}
                                        value={projA11YProgress}
                                    />
                                </Form.Field>
                                <Form.Select
                                    fluid
                                    label={<label>Status</label>}
                                    placeholder='Status...'
                                    options={editStatusOptions}
                                    onChange={(_e, { value }) => setProjStatus(value)}
                                    value={projStatus}
                                    disabled={projStatus === 'completed'}
                                />
                                <Form.Select
                                    fluid
                                    label={<label>Classification</label>}
                                    placeholder='Classification...'
                                    options={classificationOptions}
                                    onChange={(_e, { value }) => setProjClassification(value)}
                                    value={projClassification}
                                />
                                <Form.Select
                                    fluid
                                    label={<label>Visibility</label>}
                                    selection
                                    options={visibilityOptions}
                                    value={projVisibility}
                                    onChange={(_e, { value }) => setProjVisibility(value)}
                                />
                                <Form.Field>
                                    <label>Project URL <span className='muted-text'>(if applicable)</span></label>
                                    <Form.Input
                                        name='projectURL'
                                        type='url'
                                        placeholder='Enter project URL...'
                                        onChange={(e) => setProjURL(e.target.value)}
                                        value={projURL}
                                    />
                                </Form.Field>
                                <Form.Dropdown
                                    label='Project Tags'
                                    placeholder='Search tags...'
                                    multiple
                                    search
                                    selection
                                    allowAdditions
                                    options={tagOptions}
                                    loading={!loadedTags}
                                    disabled={!loadedTags}
                                    onChange={(_e, { value }) => setProjTags(value)}
                                    onAddItem={(_e, { value }) => setTagOptions([{ text: value, value }, ...tagOptions])}
                                    renderLabel={(tag) => ({
                                        color: 'blue',
                                        content: tag.text
                                    })}
                                    value={projTags}
                                />
                                <Divider />
                                <Header as='h3'>LibreText Information</Header>
                                <p><em>Use this section if your project pertains to an existing LibreText on the live libraries.</em></p>
                                <Form.Group widths='equal'>
                                    <Form.Select
                                        fluid
                                        label='Library'
                                        placeholder='Library...'
                                        options={libraryOptions}
                                        onChange={(_e, { value }) => setProjLibreLibrary(value)}
                                        value={projLibreLibrary}
                                    />
                                    <Form.Field>
                                        <label htmlFor='coverpageID'>
                                            <span className='mr-1p'>Coverpage ID</span>
                                            <Popup
                                                content={
                                                    <span>
                                                        This is the 'Page ID' of the <strong>topmost</strong> page of your LibreText (typically the chapter listing). It is visible when logged into a library with editing privileges.
                                                    </span>
                                                }
                                                trigger={<Icon name='info circle' />}
                                            />
                                        </label>
                                        <Form.Input
                                            name='coverpageID'
                                            type='text'
                                            placeholder='Enter Coverpage ID...'
                                            onChange={(e) => setProjLibreCoverID(e.target.value)}
                                            value={projLibreCoverID}
                                        />
                                    </Form.Field>
                                </Form.Group>
                                <Divider />
                                <Header as='h3'>Resource Information</Header>
                                <p><em>Use this section if your project pertains to a particular resource or tool.</em></p>
                                <Form.Group widths='equal'>
                                    <Form.Field>
                                        <label>Author</label>
                                        <Form.Input
                                            name='resourceAuthor'
                                            type='text'
                                            placeholder='Enter resource author name...'
                                            onChange={(e) => setProjResAuthor(e.target.value)}
                                            value={projResAuthor}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <label>Author's Email</label>
                                        <Form.Input
                                            name='resourceEmail'
                                            type='email'
                                            placeholder="Enter resource author's email..."
                                            onChange={(e) => setProjResEmail(e.target.value)}
                                            value={projResEmail}
                                        />
                                    </Form.Field>
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Select
                                        fluid
                                        label='License'
                                        placeholder='License...'
                                        options={licenseOptions}
                                        onChange={(_e, { value }) => setProjResLicense(value)}
                                        value={projResLicense}
                                    />
                                    <Form.Field>
                                        <label>Original URL</label>
                                        <Form.Input
                                            name='resourceURL'
                                            type='url'
                                            placeholder='Enter resource URL...'
                                            onChange={(e) => setProjResURL(e.target.value)}
                                            value={projResURL}
                                        />
                                    </Form.Field>
                                </Form.Group>
                                <Divider />
                                <Header as='h3'>Additional Information</Header>
                                <Form.Field>
                                    <label>Notes</label>
                                    <ConductorTextArea
                                        placeholder='Enter additional notes here...'
                                        textValue={projNotes}
                                        onTextChange={(value) => setProjNotes(value)}
                                        inputType='notes'
                                        showSendButton={false}
                                    />
                                </Form.Field>
                            </Form>
                            <Accordion className='mt-2p' panels={[{
                                key: 'danger',
                                title: {
                                    content: <span className='color-semanticred'><strong>Danger Zone</strong></span>
                                },
                                content: {
                                    content: (
                                        <div>
                                            <p className='color-semanticred'>Use caution with the options in this area!</p>
                                            <Button
                                                color='red'
                                                fluid
                                                onClick={() => setShowDeleteProjModal(true)}
                                            >
                                                <Icon name='trash alternate' />
                                                Delete Project
                                            </Button>
                                        </div>
                                    )
                                }
                            }]} />
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                onClick={closeEditInfoModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                icon
                                labelPosition='left'
                                color='green'
                                loading={editModalLoading}
                                onClick={submitEditInfoForm}
                            >
                                <Icon name='save' />
                                Save Changes
                            </Button>
                        </Modal.Actions>
                    </Modal>
                    {/* Manage Collaborators Modal */}
                    <Modal
                        open={showCollabsModal}
                        onClose={closeCollabsModal}
                        size='large'
                        closeIcon
                    >
                        <Modal.Header>Manage Project Team</Modal.Header>
                        <Modal.Content scrolling id='project-manage-team-content'>
                            <Form noValidate>
                                <Form.Select
                                    search
                                    label='Add Team Member'
                                    placeholder='Choose...'
                                    options={collabsUserOptions}
                                    onChange={(_e, { value }) => {
                                        setCollabsUserToAdd(value);
                                    }}
                                    value={collabsUserToAdd}
                                    loading={collabsUserOptsLoading}
                                    disabled={collabsUserOptsLoading}
                                />
                                <Button
                                    fluid
                                    disabled={isEmptyString(collabsUserToAdd)}
                                    color='green'
                                    loading={collabsModalLoading}
                                    onClick={submitAddCollaborator}
                                >
                                    <Icon name='add user' />
                                    Add Team Member
                                </Button>
                            </Form>
                            <Divider />
                            <List divided verticalAlign='middle'>
                                <List.Item key={project.owner?.uuid || 'owner'}>
                                    <Image avatar src={project.owner?.avatar || '/mini_logo.png'} />
                                    <List.Content>
                                        {project.owner?.firstName} {project.owner?.lastName} (<em>Lead</em>)
                                    </List.Content>
                                </List.Item>
                                {(hasCollabs && project.collaborators.map((item, idx) => {
                                    return (
                                        <List.Item key={idx}>
                                            <List.Content floated='right'>
                                                <Button
                                                    color='red'
                                                    onClick={() => submitRemoveCollaborator(item.uuid)}
                                                >
                                                    Remove
                                                </Button>
                                            </List.Content>
                                            <Image avatar src={item.avatar} />
                                            <List.Content>{item.firstName} {item.lastName}</List.Content>
                                        </List.Item>
                                    )
                                }))}
                            </List>
                        </Modal.Content>
                    </Modal>
                    {/* Confirm Delete Modal */}
                    <Modal
                        open={showDeleteProjModal}
                        closeOnDimmerClick={false}
                    >
                        <Modal.Header>Confirm Project Deletion</Modal.Header>
                        <Modal.Content>
                            <p>Are you sure you want to delete this project? <strong>This cannot be undone.</strong></p>
                            <Button
                                color='red'
                                fluid
                                loading={deleteProjModalLoading}
                                onClick={submitDeleteProject}
                            >
                                <Icon name='trash alternate' />
                                Delete Project
                            </Button>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                onClick={() => setShowDeleteProjModal(false)}
                            >
                                Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                    {/* Complete Project Modal */}
                    <Modal
                        open={showCompleteProjModal}
                        onClose={() => setShowCompleteProjModal(false)}
                    >
                        <Modal.Header>Complete Project</Modal.Header>
                        <Modal.Content>
                            <p className='text-center'>Are you sure you want to mark this project as completed?</p>
                            {(project.hasOwnProperty('currentProgress') && project.currentProgress < 100) &&
                                <p className='text-center'><em>This project has not reached 100% progress yet.</em></p>
                            }
                            <Button
                                color='green'
                                loading={completeProjModalLoading}
                                onClick={submitMarkCompleted}
                                fluid
                            >
                                <Icon name='check circle' />
                                Mark Completed
                            </Button>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                onClick={() => setShowCompleteProjModal(false)}
                            >
                                Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                    {/* Add Task Modal */}
                    <Modal
                        open={showAddTaskModal}
                        closeOnDimmerClick={false}
                    >
                        <Modal.Header>New Task</Modal.Header>
                        <Modal.Content>
                            <p><em>To add a subtask, use the add button on a task listing.</em></p>
                            <Form noValidate>
                                <Form.Field
                                    required={true}
                                    error={addTaskTitleErr}
                                >
                                    <label>Title</label>
                                    <Input
                                        type='text'
                                        placeholder='Title...'
                                        icon='file'
                                        iconPosition='left'
                                        onChange={(e) => setAddTaskTitle(e.target.value)}
                                        value={addTaskTitle}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <label>Description</label>
                                    <Input
                                        type='text'
                                        placeholder='Description...'
                                        icon='file alternate'
                                        iconPosition='left'
                                        onChange={(e) => setAddTaskDescrip(e.target.value)}
                                        value={addTaskDescrip}
                                    />
                                </Form.Field>
                                <Form.Select
                                    label='Status'
                                    options={createTaskOptions}
                                    onChange={(e, { value }) => setAddTaskStatus(value)}
                                    value={addTaskStatus}
                                />
                                <Form.Select
                                    label='Dependencies (must be completed before this task can be completed)'
                                    options={addTaskDepOptions}
                                    onChange={(_e, { value }) => setAddTaskDeps(value)}
                                    value={addTaskDeps}
                                    multiple
                                    search
                                />
                                <Form.Select
                                    label='Assignees'
                                    options={addTaskAssignOptions}
                                    onChange={(_e, { value }) => setAddTaskAssigns(value)}
                                    value={addTaskAssigns}
                                    multiple
                                    search
                                />
                            </Form>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                onClick={closeAddTaskModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                color='green'
                                loading={addTaskLoading}
                                onClick={submitAddTask}
                            >
                                <Icon name='add' />
                                Add Task
                            </Button>
                        </Modal.Actions>
                    </Modal>
                    {/* View Task Modal */}
                    <Modal
                        open={showViewTaskModal}
                        onClose={closeViewTaskModal}
                        size='fullscreen'
                        closeIcon
                        style={{
                            left: 'auto !important',
                            right: 'auto !important'
                        }}
                    >
                        <Modal.Header>
                            <em>{viewTaskData.hasOwnProperty('title') ? viewTaskData.title : 'Loading...'}</em>
                        </Modal.Header>
                        <Modal.Content scrolling>
                            <div className='flex-row-div'>
                                <div>
                                    <Header sub>Status</Header>
                                    <p className={(viewTaskData.status === 'completed') ? 'color-semanticgreen' : (viewTaskData.status === 'inprogress' ? 'color-semanticblue' : 'color-semanticteal')}>{getTaskStatusText(viewTaskData.status)}</p>
                                </div>
                                <div>
                                    <Header sub>Created</Header>
                                    <p>October 7th, 2021</p>
                                </div>
                                <div>
                                    <Header sub>Assignees</Header>
                                    <p>Avis here...</p>
                                </div>
                            </div>
                            <Header as='h3' dividing>Description</Header>
                            <p>{viewTaskData.description}</p>
                            <Header as='h3' dividing>Subtasks</Header>
                        </Modal.Content>
                    </Modal>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );

};

export default ProjectView;




/*
TASK INTERFACE: DO NOT DELETE!!!!!!
{canViewDetails &&
    <Grid.Column>
        <Header as='h2' dividing>Tasks</Header>
        <Segment.Group size='large' raised className='mb-4p'>
            <Segment>
                <div className='flex-row-div'>
                    <div className='left-flex'>
                        <Search
                            input={{
                                icon: 'search',
                                iconPosition: 'left',
                                placeholder: 'Search tasks...'
                            }}
                            loading={taskSearchLoading}
                            onResultSelect={(_e, { result }) => console.log(result)}
                            onSearchChange={handleTaskSearch}
                            results={taskSearchResults}
                            value={taskSearchQuery}
                        />
                    </div>
                    <div className='right-flex'>
                        <Button.Group>
                            <Button
                                color='orange'
                                onClick={expandCollapseAllTasks}
                            >
                                <Icon name='arrows alternate vertical' />
                                Expand/Collapse All
                            </Button>
                            <Button
                                color='olive'
                            >
                                <Icon name='add circle' />
                                Batch Add
                            </Button>
                            <Button
                                color='green'
                                loading={addTaskLoading}
                                onClick={openAddTaskModal}
                            >
                                <Icon name='add' />
                                Add Task
                            </Button>
                        </Button.Group>

                    </div>
                </div>
            </Segment>
            <Segment loading={loadingTasks}>
                <List divided verticalAlign='middle'>
                    {projTasks.map((item, idx) => {
                        return (
                            <List.Item key={item.taskID}>
                                <div className='flex-col-div'>
                                    <div className='flex-row-div'>
                                        <div className='left-flex'>
                                            <Icon
                                                name={item.uiOpen ? 'chevron down' : 'chevron right'}
                                                className='pointer-hover'
                                                onClick={() => toggleTaskDetail(item.taskID)}
                                                />
                                                <p className='project-task-title'>{item.title} {(item.status === 'completed') && <Icon name='check' color='green' />}</p>
                                        </div>
                                      <div className='right-flex'>
                                          <Button
                                            onClick={() => openViewTaskModal(item.taskID)}
                                            icon='search'
                                            color='blue'
                                        >
                                        </Button>
                                      </div>
                                    </div>
                                    <div className={item.uiOpen ? 'project-task-detail' : 'project-task-detail hidden'}>
                                        <List divided verticalAlign='middle'>
                                            {(item.hasOwnProperty('subtasks') && item.subtasks.length > 0)
                                                ? item.subtasks.map((subtask) => {
                                                    return (
                                                        <List.Item className='project-task-subtask' key={subtask.taskID}>
                                                            <div className='flex-row-div'>
                                                                <div className='left-flex'>
                                                                    <Icon
                                                                        name={subtask.status === 'completed' ? 'check' : 'circle outline'}
                                                                        color={subtask.status === 'completed' ? 'green' : 'black'}
                                                                    />
                                                                    <p className='project-task-title'>{subtask.title}</p>
                                                                </div>
                                                              <div className='right-flex'>
                                                                  <Button icon='search' color='blue'></Button>
                                                              </div>
                                                            </div>
                                                        </List.Item>
                                                    )
                                                })
                                                : (
                                                    <List.Item className='project-task-subtask'>
                                                        <p><em>No subtasks yet.</em></p>
                                                    </List.Item>
                                                )
                                            }
                                        </List>
                                    </div>
                                </div>
                            </List.Item>
                        )
                    })}
                </List>
            </Segment>
        </Segment.Group>
    </Grid.Column>
}
{!canViewDetails &&
    <Grid.Column>
        <Header as='h2' dividing>Tasks</Header>
        <Segment
            size='large'
            raised
            className='mb-2p'
        >
            <p><em>You don't have permission to view this project's Tasks yet.</em></p>
        </Segment>
    </Grid.Column>
}
*/
