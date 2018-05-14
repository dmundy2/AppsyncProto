<template>
      <div class="doc">
        <div class="doc__background-ribbon"></div>
        <input v-model="textOnPage" v-on:keyup="debouncedMethod()" id="doc" ref="doc" class="doc__text-editor">
        <input v-model="textOnPage2" v-on:keyup="debouncedMethod2()" id="doc" ref="doc" class="doc__text-editor">
      </div>

</template>

<script>/* eslint-disable */

import addText from '../mutations/AddText';
import updateText from '../mutations/UpdateText';
import getText from '../queries/GetText';
import textAdded from '../subscriptions/textAdded'
import config from '../config';
import uuidV4 from 'uuid/v4';
import _ from 'lodash';

export default {
  data () {
    return {
      getTextOnPage: '',
      getTextOnPage2: '',
      count: 0,
      id: '100',
      textOnPage: '',
      textOnPage2: '',
      loaded: false,
      textChangedQueue: [],
      textChangedQueue2: []
    };
  },
  apollo: {
    getTextOnPage: {
      query() {
        return getText;
      },
      variables() {
        return {
          id: config.APP.session1
        }
      }
    },
    getTextOnPage2: {
      query() {
        return getText;
      },
      variables() {
        return {
          id: config.APP.session2
        }
      },
      update(data) {
        console.log('here ' + JSON.stringify(data));
        return data;
      }
    }
  },
  methods: {

    debouncedMethod: _.debounce(function() {

      this.textChangedQueue.push(this.textOnPage);

      if (this.textChangedQueue.length === 1) {
        this.onTextChanged(config.APP.session1, this.textOnPage, this.textChangedQueue);
      }
    },200),

    debouncedMethod2: _.debounce(function() {

      this.textChangedQueue2.push(this.textOnPage2);

      if (this.textChangedQueue2.length === 1) {
        this.onTextChanged(config.APP.session2, this.textOnPage2, this.textChangedQueue2);
      }
    },200),

    onTextChanged(id, newText, textChangedQueue) {

      if (newText === '') {
        newText = ' ';
      }
      console.log(newText);
      //const id = uuidV4();
      const text = {
        id,
        text: newText
      };

      this.$apollo.mutate({
        mutation: updateText,
        variables: text
      }).then(data => {

        if (textChangedQueue.length > 0) {

          console.log("array1 " + JSON.stringify(textChangedQueue));
          textChangedQueue.shift();
          console.log("array2 " + JSON.stringify(textChangedQueue));
          if (textChangedQueue.length > 0) {
            console.log("array3 " + JSON.stringify(textChangedQueue));
            this.onTextChanged(id, textChangedQueue[0], textChangedQueue);
          }
        }
        console.log(data);
      }).catch(error => {
        console.error(error);
      });
    }
  },
  mounted() {

    let that;
    that = this;

    this.$apollo.queries.getTextOnPage
                .refetch({id:config.APP.session1})
                .then(function success(data) {
                   console.log("success "+ JSON.stringify(data) );
                   console.log(data.data.getTextOnPage.text + ' dfd1111');
                   that.textOnPage = data.data.getTextOnPage.text;
                });

    this.$apollo.queries.getTextOnPage2
      .refetch({id:config.APP.session2})
      .then(function success(data) {

        console.log("success "+ JSON.stringify(data) );
        if(data.data.getTextOnPage == null) {

          const id = config.APP.session2;
          const text = {
            id,
            text: ' '
          };

          that.$apollo.mutate({
            mutation: addText,
            variables: text
          }).then(function success() {
            console.log('created');
          }).catch(error => {
            console.error(error);
          });

        } else {
          console.log(data.data.getTextOnPage.text + ' dfd2222');
          that.textOnPage2 = data.data.getTextOnPage.text;
        }
      });

    const subQuery = textAdded;

    this.textOnPage = this.getTextOnPage;

    const observer = this.$apollo.subscribe({
      query: subQuery,
      variables: {
        id: config.APP.session1,
      },
    });

    const observer2 = this.$apollo.subscribe({
      query: subQuery,
      variables: {
        id: config.APP.session2,
      },
    });

    observer.subscribe({
      next(data) {
        that.textOnPage = data.data.onUpdateTextOnPage.text;
      },
      error(error) {
        console.error(error);
      }
    });

    observer2.subscribe({
      next(data) {
        console.log('subscription2 ' + data.data.onUpdateTextOnPage.text)
        that.textOnPage2 = data.data.onUpdateTextOnPage.text;
      },
      error(error) {
        console.error(error);
      }
    });

    var doc = this.$refs.doc;
    doc.contentEditable = true;
    doc.focus();
  }
};
</script>

<style scoped>

  .doc .doc__background-ribbon {
    height: 200px;
    background: #3F51B5;
  }

  .doc .doc__text-editor {
    width: 60%;
    padding: 40px 28px;
    min-height: 300px;
    background: #fff;
    margin: 0 auto;
    position: relative;
    top: -150px;
    font-size: 24px;
  }

</style>
