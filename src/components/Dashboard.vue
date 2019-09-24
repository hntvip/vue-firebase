<template>
  <div id="dashboard">
    <section>
      <div class="col1">
        <div class="profile">
          <h5>name : {{ userProfile.name }}</h5>
          <p>title : {{ userProfile.title }}</p>
          <div class="create-post">
            <p>create a post</p>
            <form @submit.prevent>
              <textarea v-model="post.content"></textarea>
              <button
                class="button"
                :disabled="post.content == ''"
                @click="createPost"
              >
                post
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="col2">
        <transition name="fade">
          <div
            v-if="hiddenPosts.length"
            @click="showNewPosts"
            class="hidden-posts"
          >
            <p>
              Click to show
              <span class="new-posts">{{ hiddenPosts.length }}</span>
              new
              <span v-if="hiddenPosts.length > 1">posts</span>
              <span v-else>post</span>
            </p>
          </div>
        </transition>
        <div v-if="posts.length">
          <div v-for="post in posts" :key="post.id" class="post">
            <h5>{{ post.userName }}</h5>
            <span>{{ post.createdOn | formatDate }}</span>
            <p>{{ post.content | trimLength }}</p>
            <ul>
              <li>
                <a @click="openCommentModal(post)"
                  >comments {{ post.comments }}</a
                >
              </li>
              <li>
                <a @click="likePost(post.id, post.likes)">
                  likes {{ post.likes }}</a
                >
              </li>
              <li>
                <a @click="viewPost(post)">view full post</a>
              </li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p class="no-results">There are currently no posts</p>
        </div>
      </div>
    </section>
    <!-- comment modal -->
    <transition name="fade">
      <div v-if="showCommentModal" class="c-modal">
        <div class="c-container">
          <a @click="closeCommentModal">X</a>
          <p>add a comment</p>
          <form @submit.prevent>
            <textarea v-model.trim="comment.content"></textarea>
            <button
              @click="addComment"
              :disabled="comment.content == ''"
              class="button"
            >
              add comment
            </button>
          </form>
        </div>
      </div>
    </transition>
    <!-- post modal -->
    <transition name="fade">
      <div v-if="showPostModal" class="p-modal">
        <div class="p-container">
          <a @click="closePostModal" class="close">X</a>
          <div class="post">
            <h5>{{ fullPost.userName }}</h5>
            <span>{{ fullPost.createdOn | formatDate }}</span>
            <p>{{ fullPost.content }}</p>
            <ul>
              <li>
                <a>comments {{ fullPost.comments }}</a>
              </li>
              <li>
                <a>likes {{ fullPost.likes }}</a>
              </li>
            </ul>
          </div>
          <div v-show="postComments.length" class="comments">
            <div
              v-for="comment in postComments"
              :key="comment.id"
              class="comment"
            >
              <!-- <p>{{ comment.userName }}</p> -->
              <span>{{ comment.createdOn | formatDate }}</span>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from "vuex";
const fb = require("../firebaseConfig.js");
import moment from "moment";
export default {
  name: "Dashboard",
  props: {
    msg: String
  },
  filters: {
    formatDate(val) {
      if (!val) {
        return "-";
      }
      let date = val.toDate();
      return moment(date).fromNow();
    },
    trimLength(val) {
      if (val.length < 200) {
        return val;
      }
      return `${val.substring(0, 200)}...`;
    }
  },
  data() {
    return {
      post: {
        content: "",
        comments: 0,
        likes: 0
      },
      comment: {
        postId: "",
        userId: "",
        content: "",
        postComments: 0
      },
      postComments: [],
      fullPost: {},
      showCommentModal: false,
      showPostModal: false
    };
  },
  mounted() {
    this.getPosts();
  },
  computed: {
    ...mapState(["userProfile", "currentUser", "posts", "hiddenPosts", "posts"])
  },
  methods: {
    likePost(postId, postLikes) {
      let docId = `${this.currentUser.uid}_${postId}`;
      fb.likesCollection
        .doc(docId)
        .get()
        .then(doc => {
          if (doc.exists) {
            return;
          }
          fb.likesCollection
            .doc(docId)
            .set({
              userId: this.currentUser.uid,
              postId: postId
            })
            .then(() => {
              fb.postsCollection
                .doc(postId)
                .update({
                  likes: postLikes + 1
                })
                .then(() => {
                  console.log("cap nhat thanh cong");
                })
                .catch(() => {
                  console.log("cap nhat that bai");
                });
            });
        })
        .catch(err => {
          console.log(err);
        });
    },
    createPost() {
      fb.postsCollection
        .add({
          createdOn: new Date(),
          content: this.post.content,
          userId: this.currentUser.uid,
          userName: this.userProfile.name,
          comments: 0,
          likes: 0
        })
        // eslint-disable-next-line no-unused-vars
        .then(ref => {
          this.post.content = "";
        })
        .catch(err => {
          console.log(err);
        });
    },
    getPosts() {
      fb.postsCollection
        .orderBy("createdOn", "desc")
        .onSnapshot(querySnapshot => {
          let createdByCurrentUser;
          // let listChange = querySnapshot.docChanges();
          let listDocs = querySnapshot.docs;
          var hiddenPosts = [];
          let assetPosts = [];
          for (let index = 0; index < listDocs.length; index++) {
            // let document = listDocs[index].doc;
            let document = listDocs[index];
            let userId = document.data().userId;
            let post = document.data();

            post.id = document.id;

            createdByCurrentUser =
              userId === this.currentUser.uid ? true : false;

            if (createdByCurrentUser) {
              assetPosts.push(post);
            } else {
              hiddenPosts.push(post);
            }
          }

          this.$store.commit("setHiddenPosts", hiddenPosts);
          this.$store.commit("setPosts", assetPosts);
        });
    },
    showNewPosts() {
      let updatedPostsArray = this.hiddenPosts.concat(this.posts);
      // clear hiddenPosts array and update posts array
      this.$store.commit("setHiddenPosts", null);
      this.$store.commit("setPosts", updatedPostsArray);
    },
    openCommentModal(post) {
      this.showCommentModal = true;
      this.comment.postId = post.id;
      this.comment.postComments = post.comments;
    },

    closeCommentModal() {
      this.comment.content = "";
      this.comment.postId = "";
      this.showCommentModal = false;
    },

    addComment() {
      let postId = this.comment.postId;
      let postComments = this.comment.postComments;
      fb.commentsCollection
        .add({
          createdOn: new Date(),
          content: this.comment.content,
          userId: this.currentUser.uid,
          postId: this.comment.postId,
          userName: this.userProfile.name
        })
        .then(() => {
          this.comment.content = "";
          fb.postsCollection
            .doc(postId)
            .update({
              comments: postComments + 1
            })
            .then(() => {
              this.closeCommentModal();
            })
            .catch(() => {
              this.closeCommentModal();
            });
        });
    },

    viewPost(post) {
      fb.commentsCollection
        .where("postId", "==", post.id)
        .get()
        .then(docs => {
          let commentsArray = [];
          docs.forEach(doc => {
            let comment = doc.data();
            comment.id = doc.id;
            commentsArray.push(comment);
          });
          this.postComments = commentsArray;
          this.showPostModal = true;
          this.fullPost = post;
        })
        .catch(err => {
          console.log(err);
        });
    },

    closePostModal() {
      this.showPostModal = false;
      this.fullPost = {};
      this.postComments = [];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
