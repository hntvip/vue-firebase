<template>
  <div id="login">
    <transition name="fade">
      <div v-if="performingRequest" class="loading">
        <p>Loading...</p>
      </div>
    </transition>
    <section>
      <div class="col1">
        <h1>Vuegram</h1>
        <p>
          Welcome to the
          <a href="https://savvyapps.com/" target="_blank">Savvy Apps</a> sample
          social media web app powered by Vue.js and Firebase. Build this
          project by checking out The Definitive Guide to Getting Started with
          Vue.js
        </p>
      </div>
      <div class="col2" :class="{ 'signup-form': !showLoginForm }">
        <div v-if="!showForgotPassword">
          <form v-if="showLoginForm" @submit.prevent>
            <h1>Welcome Back</h1>

            <label for="email1">Email</label>
            <input
              type="text"
              placeholder="you@email.com"
              id="email1"
              v-model="loginForm.email"
            />

            <label for="password1">Password</label>
            <input
              type="password"
              placeholder="******"
              id="password1"
              v-model="loginForm.password"
            />

            <button @click="login" class="button">Log In</button>

            <div class="extras">
              <a @click="togglePasswordReset(true)">Forgot Password</a>
              <a @click="toggleForm">Create an Account</a>
            </div>
          </form>
          <form v-else @submit.prevent>
            <h1>Get Started</h1>

            <label for="name">Name</label>
            <input
              v-model.trim="signupForm.name"
              type="text"
              placeholder="Savvy Apps"
              id="name"
            />

            <label for="title">Title</label>
            <input
              v-model.trim="signupForm.title"
              type="text"
              placeholder="Company"
              id="title"
            />

            <label for="email2">Email</label>
            <input
              v-model.trim="signupForm.email"
              type="text"
              placeholder="you@email.com"
              id="email2"
            />

            <label for="password2">Password</label>
            <input
              v-model.trim="signupForm.password"
              type="password"
              placeholder="min 6 characters"
              id="password2"
            />

            <button @click="signup" class="button">Sign Up</button>

            <div class="extras">
              <a @click="toggleForm">Back to Log In</a>
            </div>
          </form>
        </div>
        <div v-else>
          <form @submit.prevent class="password-reset">
            <div v-if="!passwordResetSuccess">
              <h1>Reset Password</h1>
              <p>We will send you an email to reset your password</p>

              <label for="email3">Email</label>
              <input
                v-model.trim="passwordForm.email"
                type="text"
                placeholder="you@email.com"
                id="email3"
              />

              <button @click="resetPassword" class="button">Submit</button>

              <div class="extras">
                <a @click="togglePasswordReset(false)">Back to Log In</a>
              </div>
            </div>
            <div v-else>
              <h1>Email Sent</h1>
              <p>check your email for a link to reset your password</p>
              <button @click="togglePasswordReset(false)" class="button">
                Back to login
              </button>
            </div>
          </form>
        </div>
        <transition name="fade">
          <div v-if="errorMsg !== ''" class="error-msg">
            <p>{{ errorMsg }}</p>
          </div>
        </transition>
      </div>
    </section>
  </div>
</template>

<script>
import firebase from "firebase";
const fb = require("../firebaseConfig.js");
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        email: "",
        password: ""
      },
      signupForm: {
        name: "",
        title: "",
        email: "",
        password: ""
      },
      passwordForm: {
        email: ""
      },
      errorMsg: "",
      showLoginForm: true,
      performingRequest: false,
      showForgotPassword: false,
      passwordResetSuccess: false
    };
  },
  methods: {
    login() {
      this.performingRequest = true;
      firebase
        .auth()
        .signInWithEmailAndPassword(
          this.loginForm.email,
          this.loginForm.password
        )
        .then(result => {
          this.performingRequest = false;
          let user = result.user;
          this.$store.commit("setCurrentUser", user);
          this.$store.dispatch("fetchUserProfile");
          this.$router.push("/dashboard");
        })
        .catch(error => {
          this.performingRequest = false;
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === "auth/wrong-password") {
            alert("Wrong password.");
          } else {
            alert(errorMessage);
          }
          this.errorMsg = error.message;
        });
    },
    signup() {
      this.performingRequest = true;
      fb.auth
        .createUserWithEmailAndPassword(
          this.signupForm.email,
          this.signupForm.password
        )
        .then(result => {
          this.performingRequest = false;
          let user = result.user;
          this.$store.commit("setCurrentUser", user);

          // create user obj
          fb.usersCollection
            .doc(user.uid)
            .set({
              name: this.signupForm.name,
              title: this.signupForm.title
            })
            .then(() => {
              this.$store.dispatch("fetchUserProfile");
              this.$router.push("/dashboard");
            })
            .catch(err => {
              this.performingRequest = false;
              this.errorMsg = err.message;
            });
        })
        .catch(err => {
          console.log(err);
        });
    },
    resetPassword() {
      this.performingRequest = true;

      fb.auth
        .sendPasswordResetEmail(this.passwordForm.email)
        .then(() => {
          this.performingRequest = false;
          this.passwordResetSuccess = true;
          this.passwordForm.email = "";
        })
        .catch(err => {
          this.performingRequest = false;
          this.errorMsg = err.message;
        });
    },
    toggleForm() {
      this.errorMsg = "";
      this.showLoginForm = !this.showLoginForm;
    },
    togglePasswordReset(isPasswordShow) {
      this.errorMsg = "";
      this.showForgotPassword = isPasswordShow;
    }
  }
};
</script>
