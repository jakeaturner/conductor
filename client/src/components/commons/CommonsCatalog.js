import './Commons.css';

import { Link } from 'react-router-dom';
import {
    Grid,
    Image,
    Dropdown,
    Segment,
    Input,
    Pagination,
    Card,
    Table,
    Header,
    Accordion,
    Icon,
    Button
} from 'semantic-ui-react';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import Breakpoint from '../util/Breakpoints.js';
import axios from 'axios';
import queryString from 'query-string';

import {
    getShelfOptions,

} from '../util/HarvestingMasterOptions.js';
import {
    libraryOptions,
    getLibGlyphURL,
    getLibraryName
} from '../util/LibraryOptions.js';
import { licenseOptions } from '../util/LicenseOptions.js';
import useGlobalError from '../error/ErrorHooks.js';
import { catalogItemsPerPageOptions } from '../util/PaginationOptions.js';
import { catalogDisplayOptions } from '../util/CatalogOptions.js';
import { updateParams, isEmptyString } from '../util/HelperFunctions.js';

const CommonsCatalog = (_props) => {

    const { handleGlobalError } = useGlobalError();

    // Global State and Location/History
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();
    const org = useSelector((state) => state.org);

    // Data
    const [catalogBooks, setCatalogBooks] = useState([]);
    const [pageBooks, setPageBooks] = useState([]);

    /** UI **/
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [activePage, setActivePage] = useState(1);
    const [loadedData, setLoadedData] = useState(false);
    const [loadedFilters, setLoadedFilters] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const initialSearch = useRef(false);
    const checkedParams = useRef(false);

    // Content Filters
    const [searchString, setSearchString] = useState('');
    const [libraryFilter, setLibraryFilter] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [licenseFilter, setLicenseFilter] = useState('');
    const [affilFilter, setAffilFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');

    const [subjectOptions, setSubjectOptions] = useState([]);
    const [authorOptions, setAuthorOptions] = useState([]);
    const [affOptions, setAffOptions] = useState([]);
    const [courseOptions, setCourseOptions] = useState([]);

    // Sort and Search Filters
    const [sortChoice, setSortChoice] = useState('title');
    const [displayChoice, setDisplayChoice] = useState('visual');

    const sortOptions = [
        { key: 'title', text: 'Sort by Title', value: 'title' },
        { key: 'author', text: 'Sort by Author', value: 'author' }
    ];

    /**
     * Get filter options from server
     * on initial load.
     */
    useEffect(() => {
        getFilterOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /**
     * Update the page title based on
     * Organization information.
     */
    useEffect(() => {
        if (process.env.REACT_APP_ORG_ID && process.env.REACT_APP_ORG_ID !== 'libretexts' && org.shortName) {
            document.title = org.shortName + " Commons | Catalog";
        } else {
            document.title = "LibreCommons | Catalog";
        }
    }, [org]);

    /**
     * Build the new search URL and
     * push it onto the history stack.
     * Change to location triggers the
     * network request to fetch results.
     */
    const performSearch = () => {
        if (!initialSearch.current) {
            initialSearch.current = true;
        }
        var searchURL = location.search;
        searchURL = updateParams(searchURL, 'search', searchString);
        searchURL = updateParams(searchURL, 'library', libraryFilter);
        searchURL = updateParams(searchURL, 'subject', subjectFilter)
        searchURL = updateParams(searchURL, 'author', authorFilter);
        searchURL = updateParams(searchURL, 'license', licenseFilter);
        searchURL = updateParams(searchURL, 'affiliation', affilFilter);
        searchURL = updateParams(searchURL, 'course', courseFilter);
        history.push({
            pathname: location.pathname,
            search: searchURL
        });
    };

    /**
     * Perform GET request for books
     * and update catalogBooks.
     */
    const searchCommonsCatalog = () => {
        setLoadedData(false);
        var paramsObj = {
            sort: sortChoice
        };
        if (!isEmptyString(libraryFilter)) {
            paramsObj.library = libraryFilter;
        }
        if (!isEmptyString(subjectFilter)) {
            paramsObj.subject = subjectFilter;
        }
        if (!isEmptyString(authorFilter)) {
            paramsObj.author = authorFilter;
        }
        if (!isEmptyString(licenseFilter)) {
            paramsObj.license = licenseFilter;
        }
        if (!isEmptyString(affilFilter)) {
            paramsObj.affiliation = affilFilter;
        }
        if (!isEmptyString(courseFilter)) {
            paramsObj.course = courseFilter;
        }
        if (!isEmptyString(searchString)) {
            paramsObj.search = searchString;
        }
        axios.get('/commons/catalog', {
            params: paramsObj
        }).then((res) => {
            if (!res.data.err) {
                if (res.data.books && Array.isArray(res.data.books)) {
                    setCatalogBooks(res.data.books);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
            setLoadedData(true);
        }).catch((err) => {
            handleGlobalError(err);
            setLoadedData(true);
        });
    };

    /**
     * Retrieve the list(s) of dynamic
     * filter options from the server.
     */
    const getFilterOptions = () => {
        axios.get('/commons/filters').then((res) => {
            if (!res.data.err) {
                if (res.data.authors && Array.isArray(res.data.authors)) {
                    var authorOptions = [
                        { key: 'empty', text: 'Clear...', value: '' }
                    ];
                    res.data.authors.forEach((author) => {
                        authorOptions.push({
                            key: author,
                            text: author,
                            value: author
                        });
                    });
                    setAuthorOptions(authorOptions);
                }
                if (res.data.subjects && Array.isArray(res.data.subjects)) {
                    var subjectOptions = [
                        { key: 'empty', text: 'Clear...', value: '' }
                    ];
                    res.data.subjects.forEach((subject) => {
                        subjectOptions.push({
                            key: subject,
                            text: subject,
                            value: subject
                        });
                    })
                    setSubjectOptions(subjectOptions);
                }
                if (res.data.affiliations && Array.isArray(res.data.affiliations)) {
                    var affOptions = [
                        { key: 'empty', text: 'Clear...', value: '' }
                    ];
                    res.data.affiliations.forEach((affiliation) => {
                        affOptions.push({
                            key: affiliation,
                            text: affiliation,
                            value: affiliation
                        });
                    });
                    setAffOptions(affOptions);
                }
                if (res.data.courses && Array.isArray(res.data.courses)) {
                    var courseOptions = [
                        { key: 'empty', text: 'Clear...', value: '' }
                    ];
                    res.data.courses.forEach((course) => {
                        courseOptions.push({
                            key: course,
                            text: course,
                            value: course
                        });
                    });
                    setCourseOptions(courseOptions);
                }
            } else {
                handleGlobalError(res.data.errMsg);
            }
            setLoadedFilters(true);
        }).catch((err) => {
            handleGlobalError(err);
            setLoadedFilters(true);
        });
    };

    /**
     * Perform the Catalog search based on
     * URL query change after ensuring the
     * initial URL params sync has been
     * performed.
     */
    useEffect(() => {
        if (checkedParams.current && initialSearch.current) {
            searchCommonsCatalog();
        }
    }, [checkedParams.current, initialSearch.current, location.search]);

    /**
     * Update the URL query with the sort choice
     * AFTER a search has been performed and a
     * change has been made.
     */
    useEffect(() => {
        if (initialSearch.current) {
            var searchURL = updateParams(location.search, 'sort', sortChoice);
            history.push({
                pathname: location.pathname,
                search: searchURL
            });
        }
    }, [sortChoice]);

    /**
     * Update the URL query with the display mode
     * AFTER a search has been performed and a
     * change has been made.
     */
    useEffect(() => {
        if (initialSearch.current) {
            var searchURL = updateParams(location.search, 'mode', displayChoice);
            history.push({
                pathname: location.pathname,
                search: searchURL
            });
        }
    }, [displayChoice]);

    /**
     * Track changes to the number of books loaded
     * and the selected itemsPerPage and update the
     * set of books to display.
     */
    useEffect(() => {
        setTotalPages(Math.ceil(catalogBooks.length/itemsPerPage));
        setPageBooks(catalogBooks.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage));
    }, [itemsPerPage, catalogBooks, activePage]);

    /**
     * Subscribe to changes in the URL search string
     * and update state accordingly.
     */
    useEffect(() => {
        var params = queryString.parse(location.search);
        if ((Object.keys(params).length > 0) && (!initialSearch.current)) {
            // enable results for those entering a direct search URL
            initialSearch.current = true;
        }
        if (params.mode && params.mode !== displayChoice) {
            if ((params.mode === 'visual') || (params.mode === 'itemized')) {
                setDisplayChoice(params.mode);
            }
        }
        if (params.items && params.items !== itemsPerPage) {
            if (!isNaN(parseInt(params.items))) {
                setItemsPerPage(params.items);
            }
        }
        if ((params.search !== undefined) && (params.search !== searchString)) {
            setSearchString(params.search);
        }
        if ((params.sort !== undefined) && (params.sort !== sortChoice)) {
            setSortChoice(params.sort);
        }
        if ((params.library !== undefined) && (params.library !== libraryFilter)) {
            setLibraryFilter(params.library);
        }
        if ((params.subject !== undefined) && (params.subject !== subjectFilter)) {
            setSubjectFilter(params.subject);
        }
        if ((params.license !== undefined) && (params.license !== licenseFilter)) {
            setLicenseFilter(params.license);
        }
        if ((params.author !== undefined) && (params.author !== authorFilter)) {
            setAuthorFilter(params.author);
        }
        if ((params.affiliation !== undefined) && (params.affiliation !== affilFilter)) {
            setAffilFilter(params.affiliation);
        }
        if ((params.course !== undefined) && (params.course !== courseFilter)) {
            setCourseFilter(params.course);
        }
        if (!checkedParams.current) { // set the initial URL params sync to complete
            checkedParams.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const VisualMode = () => {
        if (pageBooks.length > 0) {
            return (
                <Card.Group itemsPerRow={6} stackable>
                    {pageBooks.map((item, index) => {
                        return (
                            <Card
                                key={index}
                                as={Link}
                                to={`/book/${item.bookID}`}
                            >
                                <Image
                                    className='commons-content-card-img'
                                    src={item.thumbnail}
                                    wrapped
                                    ui={false}
                                    loading='lazy'
                                />
                                <Card.Content>
                                    <Card.Header>{item.title}</Card.Header>
                                    <Card.Meta>
                                        <Image src={getLibGlyphURL(item.library)} className='library-glyph' />
                                        {getLibraryName(item.library)}
                                    </Card.Meta>
                                    <Card.Description>
                                        <p>{item.author}</p>
                                        {((process.env.REACT_APP_ORG_ID === 'libretexts') && (item.affiliation !== '')) &&
                                            <p><em>{item.affiliation}</em></p>
                                        }
                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        )
                    })}
                </Card.Group>
            )
        } else {
            return (
                <p className='text-center'><em>No results found.</em></p>
            );
        }
    };

    const ItemizedMode = () => {
        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={5}><Header sub>Title</Header></Table.HeaderCell>
                        <Table.HeaderCell width={2}><Header sub>Author</Header></Table.HeaderCell>
                        <Table.HeaderCell width={2}><Header sub>Library</Header></Table.HeaderCell>
                        {(process.env.REACT_APP_ORG_ID === 'libretexts') &&
                            <Table.HeaderCell width={3}><Header sub>Institution</Header></Table.HeaderCell>
                        }
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {(pageBooks.length > 0) &&
                        pageBooks.map((item, index) => {
                            return (
                                <Table.Row key={index}>
                                    <Table.Cell>
                                        <p><strong><Link to={`/book/${item.bookID}`}>{item.title}</Link></strong></p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p>{item.author}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Image src={getLibGlyphURL(item.library)} className='library-glyph' />
                                        {getLibraryName(item.library)}
                                    </Table.Cell>
                                    {(process.env.REACT_APP_ORG_ID === 'libretexts') &&
                                        <Table.Cell>
                                            <p><em>{item.affiliation}</em></p>
                                        </Table.Cell>
                                    }
                                </Table.Row>
                            )
                        })
                    }
                    {(pageBooks.length === 0) &&
                        <Table.Row>
                            <Table.Cell colSpan={(process.env.REACT_APP_ORG_ID === 'libretexts') ? 4 : 3}>
                                <p className='text-center'><em>No results found.</em></p>
                            </Table.Cell>
                        </Table.Row>
                    }
                </Table.Body>
            </Table>
        )
    };


    return (
        <Grid className='commons-container'>
            <Grid.Row>
                <Grid.Column>
                    <Segment.Group raised>
                        <Segment padded>
                            <Breakpoint name='desktop'>
                                <Header id='commons-librecommons-intro-header'>The World's Most Popular Online Textbook Platform, Centralized.</Header>
                                <p id='commons-librecommons-intro'>LibreCommons hosts curated Open Educational Resources from all 14 LibreTexts libraries in one convenient location. LibreCommons, the LibreTexts Libraries, and all of our resources are accessible to everyone via the internet, completely free. We believe everyone should have access to knowledge.</p>
                            </Breakpoint>
                            <Breakpoint name='mobileOrTablet'>
                                <Header id='commons-librecommons-intro-header' textAlign='center'>The World's Most Popular Online Textbook Platform, Centralized.</Header>
                                <p id='commons-librecommons-intro' className='text-center'>LibreCommons hosts curated Open Educational Resources from all 14 LibreTexts libraries in one convenient location. LibreCommons, the LibreTexts Libraries, and all of our resources are accessible to everyone via the internet, completely free. We believe everyone should have access to knowledge.</p>
                            </Breakpoint>
                        </Segment>
                        <Segment>
                            <Breakpoint name='desktop'>
                                <Grid className={initialSearch.current ? '' : 'mt-1r mb-1r'}>
                                    <Grid.Row centered>
                                        <Grid.Column width={14}>
                                            <Input
                                                icon='search'
                                                placeholder='Search...'
                                                className='commons-filter commons-search-input'
                                                iconPosition='left'
                                                onChange={(e) => {
                                                    setSearchString(e.target.value);
                                                }}
                                                value={searchString}
                                                fluid
                                            />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row centered>
                                        <Grid.Column width={14} id='commons-filters-desktop'>
                                            <Dropdown
                                                placeholder='Library'
                                                floating
                                                selection
                                                button
                                                options={libraryOptions}
                                                onChange={(_e, { value }) => {
                                                    setLibraryFilter(value);
                                                }}
                                                value={libraryFilter}
                                                className='commons-filter'
                                            />
                                            <Dropdown
                                                placeholder='Subject'
                                                floating
                                                search
                                                selection
                                                button
                                                options={subjectOptions}
                                                onChange={(_e, { value }) => {
                                                    setSubjectFilter(value);
                                                }}
                                                value={subjectFilter}
                                                loading={!loadedFilters}
                                                className='commons-filter'
                                            />
                                            <Dropdown
                                                placeholder='Author'
                                                floating
                                                search
                                                selection
                                                button
                                                options={authorOptions}
                                                onChange={(_e, { value }) => {
                                                    setAuthorFilter(value);
                                                }}
                                                value={authorFilter}
                                                loading={!loadedFilters}
                                                className='commons-filter'
                                            />
                                            <Dropdown
                                                placeholder='License'
                                                floating
                                                selection
                                                button
                                                options={licenseOptions}
                                                onChange={(_e, { value }) => {
                                                    setLicenseFilter(value);
                                                }}
                                                value={licenseFilter}
                                                className='commons-filter'
                                            />
                                            <Dropdown
                                                placeholder='Affiliation'
                                                floating
                                                search
                                                selection
                                                button
                                                options={affOptions}
                                                onChange={(_e, { value }) => {
                                                    setAffilFilter(value);
                                                }}
                                                value={affilFilter}
                                                loading={!loadedFilters}
                                                className='commons-filter'
                                            />
                                            <Dropdown
                                                placeholder='Campus or Course'
                                                floating
                                                search
                                                selection
                                                button
                                                options={courseOptions}
                                                onChange={(_e, { value }) => {
                                                    setCourseFilter(value);
                                                }}
                                                value={courseFilter}
                                                loading={!loadedFilters}
                                                className='commons-filter'
                                            />
                                        </Grid.Column>
                                    </Grid.Row>
                                    <Grid.Row centered>
                                        <Grid.Column width={5}>
                                            <Button
                                                fluid
                                                className='commons-search-button'
                                                onClick={performSearch}
                                            >
                                                SEARCH
                                            </Button>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Breakpoint>
                            <Breakpoint name='mobileOrTablet'>
                                <Input
                                    icon='search'
                                    placeholder='Search...'
                                    className='commons-filter commons-search-input'
                                    iconPosition='left'
                                    onChange={(e) => {
                                        setSearchString(e.target.value)
                                    }}
                                    value={searchString}
                                    fluid
                                />
                                <Accordion
                                    fluid
                                    className='mt-1r'
                                >
                                    <Accordion.Title
                                        active={showMobileFilters}
                                        onClick={() => { setShowMobileFilters(!showMobileFilters) }}
                                    >
                                        <Icon name='dropdown' />
                                        <strong>Filters</strong>
                                    </Accordion.Title>
                                    <Accordion.Content active={showMobileFilters}>
                                        <Dropdown
                                            placeholder='Library'
                                            floating
                                            selection
                                            button
                                            options={libraryOptions}
                                            onChange={(_e, { value }) => {
                                                setLibraryFilter(value);
                                            }}
                                            value={libraryFilter}
                                            fluid
                                            className='commons-filter'
                                        />
                                        <Dropdown
                                            placeholder='Subject'
                                            floating
                                            search
                                            selection
                                            button
                                            options={subjectOptions}
                                            onChange={(_e, { value }) => {
                                                setSubjectFilter(value);
                                            }}
                                            value={subjectFilter}
                                            loading={!loadedFilters}
                                            fluid
                                            className='commons-filter'
                                        />
                                        <Dropdown
                                            placeholder='Author'
                                            floating
                                            search
                                            selection
                                            button
                                            options={authorOptions}
                                            onChange={(_e, { value }) => {
                                                setAuthorFilter(value);
                                            }}
                                            value={authorFilter}
                                            loading={!loadedFilters}
                                            fluid
                                            className='commons-filter'
                                        />
                                        <Dropdown
                                            placeholder='License'
                                            floating
                                            selection
                                            button
                                            options={licenseOptions}
                                            onChange={(_e, { value }) => {
                                                setLicenseFilter(value);
                                            }}
                                            value={licenseFilter}
                                            fluid
                                            className='commons-filter'
                                        />
                                        <Dropdown
                                            placeholder='Affiliation'
                                            floating
                                            search
                                            selection
                                            button
                                            options={affOptions}
                                            onChange={(_e, { value }) => {
                                                setAffilFilter(value);
                                            }}
                                            value={affilFilter}
                                            loading={!loadedFilters}
                                            fluid
                                            className='commons-filter'
                                        />
                                        <Dropdown
                                            placeholder='Campus or Course'
                                            floating
                                            search
                                            selection
                                            button
                                            options={courseOptions}
                                            onChange={(_e, { value }) => {
                                                setCourseFilter(value);
                                            }}
                                            value={courseFilter}
                                            loading={!loadedFilters}
                                            fluid
                                            className='commons-filter'
                                        />
                                    </Accordion.Content>
                                </Accordion>
                                <Grid>
                                    <Grid.Row centered>
                                        <Grid.Column width={8}>
                                            <Button
                                                fluid
                                                className='commons-search-button mt-2r mb-1r'
                                                onClick={performSearch}
                                            >
                                                SEARCH
                                            </Button>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Breakpoint>
                        </Segment>
                        {(initialSearch.current) &&
                            <Segment>
                                <Breakpoint name='desktop'>
                                    <div className='commons-content-pagemenu'>
                                        <div className='commons-content-pagemenu-left'>
                                            <span>Displaying </span>
                                            <Dropdown
                                                className='commons-content-pagemenu-dropdown'
                                                selection
                                                options={catalogItemsPerPageOptions}
                                                onChange={(_e, { value }) => {
                                                    setItemsPerPage(value);
                                                }}
                                                value={itemsPerPage}
                                            />
                                            <span> items per page of <strong>{Number(catalogBooks.length).toLocaleString()}</strong> results.</span>
                                        </div>
                                        <div className='commons-content-pagemenu-right'>
                                            <Dropdown
                                                placeholder='Sort by...'
                                                floating
                                                selection
                                                button
                                                options={sortOptions}
                                                onChange={(_e, { value }) => {
                                                    setSortChoice(value);
                                                }}
                                                value={sortChoice}
                                            />
                                            <Dropdown
                                                placeholder='Display mode...'
                                                floating
                                                selection
                                                button
                                                options={catalogDisplayOptions}
                                                onChange={(_e, { value }) => {
                                                    setDisplayChoice(value);
                                                }}
                                                value={displayChoice}
                                            />
                                            <Pagination
                                                activePage={activePage}
                                                totalPages={totalPages}
                                                firstItem={null}
                                                lastItem={null}
                                                onPageChange={(_e, data) => { setActivePage(data.activePage) }}
                                            />
                                        </div>
                                    </div>
                                </Breakpoint>
                                <Breakpoint name='mobileOrTablet'>
                                    <Grid>
                                        <Grid.Row columns={1}>
                                            <Grid.Column>
                                                <div className='center-flex flex-wrap'>
                                                    <span>Displaying </span>
                                                    <Dropdown
                                                        className='commons-content-pagemenu-dropdown'
                                                        selection
                                                        options={catalogItemsPerPageOptions}
                                                        onChange={(_e, { value }) => {
                                                            setItemsPerPage(value);
                                                        }}
                                                        value={itemsPerPage}
                                                    />
                                                    <span> items per page of <strong>{Number(catalogBooks.length).toLocaleString()}</strong> results.</span>
                                                </div>
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row columns={1}>
                                            <Grid.Column>
                                                <Dropdown
                                                    placeholder='Display mode...'
                                                    floating
                                                    selection
                                                    button
                                                    options={catalogDisplayOptions}
                                                    onChange={(_e, { value }) => {
                                                        setDisplayChoice(value);
                                                    }}
                                                    value={displayChoice}
                                                    fluid
                                                />
                                                <Dropdown
                                                    placeholder='Sort by...'
                                                    floating
                                                    selection
                                                    button
                                                    options={sortOptions}
                                                    onChange={(_e, { value }) => {
                                                        setSortChoice(value);
                                                    }}
                                                    value={sortChoice}
                                                    fluid
                                                    className='commons-filter'
                                                />
                                            </Grid.Column>
                                        </Grid.Row>
                                        <Grid.Row columns={1}>
                                            <Grid.Column id='commons-pagination-mobile-container'>
                                                <Pagination
                                                    activePage={activePage}
                                                    totalPages={totalPages}
                                                    siblingRange={1}
                                                    firstItem={null}
                                                    lastItem={null}
                                                    onPageChange={(_e, data) => { setActivePage(data.activePage) }}
                                                />
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                </Breakpoint>
                            </Segment>
                        }
                        {(initialSearch.current) &&
                            <Segment className={(displayChoice === 'visual') ? 'commons-content' : 'commons-content commons-content-itemized'} loading={!loadedData}>
                                {displayChoice === 'visual'
                                    ? (<VisualMode />)
                                    : (<ItemizedMode />)
                                }
                            </Segment>
                        }
                    </Segment.Group>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}

export default CommonsCatalog;
