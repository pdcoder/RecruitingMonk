import React, { useState, useEffect, useLayoutEffect, Component } from 'react'
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import ShareIcon from '@material-ui/icons/Share';
import BookmarkBorderOutlinedIcon from '@material-ui/icons/BookmarkBorderOutlined';
import ReportOutlinedIcon from '@material-ui/icons/ReportOutlined';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ViewDayIcon from '@material-ui/icons/ViewDay';
import profile from '../../../img/profile.jpeg'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import MoveToLib from './MoveToLib'
import PopularPosts from '../PopularPosts'
import BookPdf from './BookPdf'
import { connect } from 'react-redux'
import ReplyCompo from '../../Pages/Answers/Reply/ReplyCompo'
import ReplyDesign from '../../Pages/Answers/Reply/ReplyDesign'
import Swal from 'sweetalert2'
import '../QnA.css'
import Loader from '../../universal/Loader';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import { ReactTinyLink } from 'react-tiny-link'

var globData = [];

var numLikes = 0;

class QuesCard extends Component {
    constructor(props) {
        super(props)
        this.state = { data: [], load: false, postIds: [], likesCol: [], rowsToDis: 100 }
        this.showMore = this.showMore.bind(this);
    }

    componentDidMount() {
        this._getData();
    }

    _getData = () => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", localStorage.getItem('token'));

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://localhost:3001/posts", requestOptions)
            .then(response => {
                if (response.ok) {
                    return response;
                } else {
                    let errorMessage = `${response.status(response.statusText)}`
                    let error = new Error(errorMessage);
                    throw (error);
                }
            })
            .then(response => response.json())
            .then(result => {
                this.setState({ data: result })
                this.setState({ load: false })
            })
            .catch(error => console.log('error from QuesCard: ', error));
    }

    showMore() {
        let dataLength = this.state.rowsToDis;
        this.setState({ rowsToDis: dataLength += 10 });
    }

    render() {
        globData = this.state.data;
        return (
            <div className="mainQuesCard">
                <div>
                    {this.state.load || !this.state.data ?
                        <Loader activity="Monk Loading..." /> :
                        this.state.data.slice(0, this.state.rowsToDis).map((item, index) =>
                            (item.isQuestion == true && this.props.cat == "All") ?
                                <div key={index} className="QuesCard">
                                    <CardHead name={item.user.name} CDate={item.date.slice(0, 10)} category={item.category} text={item.text} title={item.name} />
                                    <TextCard text={item.text} name={item.name} />
                                    <Handles cardId={item._id} likes={item.likes.length} />
                                    {item.comments != null ? item.comments.map((item, index) =>
                                        item ? <div> <DisplayComment commentId={item._id} CName={item.user.name} CText={item.text} CId={item._id} CImg={item.avatar}
                                            CDate={item.date
                                                // .slice(0, 10)
                                            }
                                            commentON={true} /> </div> : ''
                                    ) : ''}

                                </div> :
                                <div>
                                    {
                                        this.props.cat == item.category[0] || this.props.cat == item.category[1] ?
                                            <div key={index} className="QuesCard">
                                                <CardHead name={item.user.name} CDate={item.date.slice(0, 10)} category={item.category} text={item.text} title={item.name} />
                                                <TextCard text={item.text} name={item.name} />
                                                <Handles cardId={item._id} likes={item.likes.length} />
                                                {item.comments != null ? item.comments.map((item, index) =>
                                                    item ? <div> <DisplayComment commentId={item._id} CName={item.user.name} CText={item.text} CId={item._id} CImg={item.avatar}
                                                        CDate={item.date
                                                            // .slice(0, 10)
                                                        }
                                                        commentON={true} /> </div> : ''
                                                ) : ''}

                                            </div> : ''
                                    }
                                </div>
                        )
                    }
                    <div className="showMore" onClick={this.showMore}>
                        <p>Show More</p>
                        <ViewDayIcon fontSize="medium" style={{ color: '#B0343C', margin: '0px 10px' }} />
                    </div>
                    <BookPdf />
                </div>
                <div>
                    <PopularPosts />
                </div>
            </div>
        )
    }
}

//Header of the card.
function CardHead(props) {
    // 3Dots style

    const [open, setOpen] = React.useState(false);
    const StyledMenu = withStyles({
        paper: {
            border: '1px solid #d3d4d5',

        },
    })((props) => (
        <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
    ));

    const StyledMenuItem = withStyles((theme) => ({
        root: {
            '&:focus': {
            },
        },
    }))(MenuItem);

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMove = () => {
        setOpen(true)
        handleClose()
    }

    return (

        <div className="topQuesHead">
            <div className="topQues">
                <div>
                    <img src={profile} alt="" />
                </div>
                <div>
                    <div className="topQues1">
                        <p style={{ fontWeight: 'bold' }}>{props.name}</p>
                    </div>
                    <div className="topQues2">
                        <p>Posted: {props.CDate.slice(8, 10)} {new Date(props.CDate.slice(0, 4), props.CDate.slice(6, 7), props.CDate.slice(8, 10)).toLocaleString('default', { month: 'short' })}</p>
                        <p>In: {props.category[props.category.length - 1]}</p>
                    </div>
                </div>
            </div>
            <div>
                <MoreVertIcon
                    aria-controls="customized-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                    style={{ color: '#707070', margin: '0px 10px', cursor: 'pointer' }} />

                <StyledMenu
                    id="customized-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <BookmarkBorderOutlinedIcon style={{ color: '#707070', margin: '0px 10px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Save post" />
                    </StyledMenuItem>
                    <StyledMenuItem>
                        <ListItemIcon>
                            <ReportOutlinedIcon style={{ color: '#707070', margin: '0px 10px' }} />
                        </ListItemIcon>
                        <ListItemText primary="Report post" />
                    </StyledMenuItem>
                    {
                        localStorage.admin == "true" ?
                            <StyledMenuItem onClick={handleMove}>
                                <ListItemIcon>
                                    <MoveToInboxIcon style={{ color: '#707070', margin: '0px 10px' }} />
                                </ListItemIcon>
                                <ListItemText primary="Move" />
                            </StyledMenuItem> : ''
                    }
                </StyledMenu>
                {
                    open == true ? <MoveToLib sub={props.category} content={props.text} title={props.title} open={open} /> : ''
                }
            </div>
        </div>
    )


}


function is_url(str) {
    var pattern = new RegExp('^((ft|htt)ps?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?' + // port
        '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    return pattern.test(str);
}

// text Card.
function TextCard(props) {
    return (
        <div className="middleQues">
            <p style={{ fontWeight: 'bold' }}>
                {props.name}
            </p>
            <p className="QuesText">
                {
                    is_url(props.text) == true ? 
                    <ReactTinyLink
                        cardSize="small"
                        showGraphic={true}
                        maxLine={2}
                        minLine={1}
                        url={props.text}
                    /> : <Linkify>{parse(props.text)}</Linkify>
                }
            </p>
        </div>
    )

}

// handles of the card.
function Handles(props) {

    const likeBtn = () => {

        if (!localStorage.getItem('token')) {
            Swal.fire({
                icon: 'error',
                title: 'Please Sign In/Up first.',
            })
        }
        else {

            var myHeaders = new Headers();
            myHeaders.append("Authorization", localStorage.getItem('token'));


            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(`https://recmonk.herokuapp.com/posts/like/${props.cardId}`, requestOptions)
                .then(response => {
                    if (response.ok) {
                        return response;
                    } else {
                        let errorMessage = `${response.status(response.statusText)}`
                        let error = new Error(errorMessage);
                        throw (error);
                    }
                })
                .then(response => response.json())
                .then(result => {
                    console.log("result like: ", result)
                    Swal.fire({
                        icon: 'success',
                        title: 'You have liked.',
                    })
                })
                .catch(error => console.log('error from QuesCard: ', error));
        }
    }

    const dislikeBtn = () => {

        if (!localStorage.getItem('token')) {
            Swal.fire({
                icon: 'error',
                title: 'Please Login/Signup first.',
            })
        }
        else {



            var myHeaders = new Headers();
            myHeaders.append("Authorization", localStorage.getItem('token'));


            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(`https://recmonk.herokuapp.com/posts/unlike/${props.cardId}`, requestOptions)
                .then(response => {
                    if (response.ok) {
                        return response;
                    } else {
                        let errorMessage = response.status + ": " + response.statusText
                        let error = new Error(errorMessage);
                        throw (error);
                    }
                })
                .then(response => response.json())
                .then(result => {
                    console.log("result unlike: ", result)
                    Swal.fire({
                        icon: 'success',
                        title: 'You have unliked.',
                    })
                })
                .catch(error => console.log('error from QuesCard: ', error));
        }
    }

    const [click, setClick] = useState(false);

    const ShowComment = () => {
        setClick(true)
    }

    const HideComment = () => {
        setClick(false)
    }


    const DeskCardHandles = () => {

        return (
            <div>
                <div className="deskBtmQeus1 btmQues1" id="deskBtmQeus1">
                    <div className="cardIcons" onClick={click == false ? ShowComment : HideComment} style={{ cursor: 'pointer' }}>
                        <CommentOutlinedIcon fontSize="medium" style={{ color: '#707070', margin: '0px 5px', cursor: 'pointer' }} />
                        <p>Answers</p>
                    </div>
                    <div className="cardIcons">
                        <VisibilityOutlinedIcon fontSize="medium" style={{ color: '#707070', margin: '0px 10px', cursor: 'pointer' }} />
                        <p>Views</p>
                    </div>
                    <div className="cardIcons">
                        <ShareIcon fontSize="medium" style={{ color: '#707070', margin: '0px 10px', cursor: 'pointer' }} />
                        <p>Share</p>
                    </div>

                </div>

            </div>
        )
    }

    return (
        <div>
            <div className="btmQues">

                <div className="mobBtmQeus1 btmQues1" id="mobBtmQeus1">
                    <div className="cardIcons" onClick={click == false ? ShowComment : HideComment}>
                        <CommentOutlinedIcon fontSize="medium" style={{ color: '#707070', margin: '0px 5px', cursor: 'pointer' }} />
                        <p>23</p>
                    </div>
                    <div className="cardIcons">
                        <VisibilityOutlinedIcon style={{ color: '#707070', margin: '0px 10px' }} />
                        <p>34</p>
                    </div>
                    <ShareIcon style={{ color: '#707070', margin: '0px 10px' }} />

                </div>
                <DeskCardHandles />
                <div className="btmQues2">
                    <div onClick={likeBtn}>
                        <ArrowDropUpIcon fontSize="large" style={{ color: '#797979', cursor: 'pointer' }} />
                    </div>
                    <p style={{ color: '#B0343C', fontWeight: 'bold' }}>
                        {props.likes}
                    </p>
                    <div onClick={dislikeBtn}>
                        <ArrowDropDownIcon fontSize="large" style={{ color: '#797979', cursor: 'pointer' }} />
                    </div>
                </div>
            </div>
            {click == true ? <div>
                <ReplyCompo CName={props.CName} CId={props.CId} CImg={props.CImg} cardId={props.cardId} />
                <DisplayComment cardId={props.cardId} CId={props.CId} />
            </div>
                : HideComment}
        </div>
    );
}

function DisplayComment(props) {
    return (
        <div className='commentCont'>
            {props.commentON == true ? <ReplyDesign CName={props.CName} CText={props.CText} CDate={props.CDate} /> : ''}
        </div>
    )
}


function mapStateToProps(state) {
    return {
        authVal: state.authUser.authUser
    }
}

export default connect(mapStateToProps)(QuesCard)
