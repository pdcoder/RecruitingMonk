import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddQuestion from './AddQuestionForm';
import AddPost from './AddPostForm';
import AddPoll from './AddPollForm';

function TabPanel(props) {
    const { children, value, index } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`post-tabpanel-${index}`}
        aria-labelledby={`post-tab-${index}`}
        className="post-tabpanel"
      >
        {value === index && (
          <div>{children}</div>
        )}
      </div>
    );
}

function Post() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    return(
        <div style={{background: '#f2f2f2', paddingBottom: '50px'}}>
            <Tabs value={value} onChange={handleChange} aria-label="post-tabs" className="post-tabs" >
                <Tab label="Add Question" />
                <Tab label="Poll" />
                <Tab label="Post" />
            </Tabs>

            <TabPanel value={value} index={0}>
                <AddQuestion />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <AddPoll />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <AddPost />
            </TabPanel>
        </div>
    );
}

export default Post;