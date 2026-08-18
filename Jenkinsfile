// Build and test on every push. Deployment is GitHub Actions' job
// (.github/workflows/deploy.yml) — Jenkins is the gate, not the deployer.
pipeline {
  agent any

  tools {
    nodejs 'node20' // configure under Manage Jenkins → Tools
  }

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      parallel {
        stage('backend') {
          steps {
            dir('backend') { sh 'npm ci' }
          }
        }
        stage('frontend') {
          steps {
            dir('frontend') { sh 'npm ci' }
          }
        }
      }
    }

    stage('Test backend') {
      steps {
        dir('backend') { sh 'npm test' }
      }
    }

    stage('Build frontend') {
      steps {
        dir('frontend') { sh 'npm run build' }
      }
    }

    stage('Archive build') {
      steps {
        archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
      }
    }
  }

  post {
    success { echo "Build ${env.BUILD_NUMBER} passed" }
    failure { echo "Build ${env.BUILD_NUMBER} failed — check the stage log above" }
    always  { cleanWs() }
  }
}
