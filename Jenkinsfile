pipeline{
  agent any
  stages{
    stage('print'){
      steps{
        sh 'chmod +x ./frontend/package.json'
       cat ./frontend/package.json
      }
    }
  }
}
