pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        // Define your Firebase token in Jenkins credentials and access it here
        // FIREBASE_TOKEN = credentials('firebase-token') 
    }

    tools {
        nodejs 'node_20' // Ensure this matches a NodeJS installation configured in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Install & Test') {
            steps {
                dir('backend') {
                    echo 'Installing Backend Dependencies...'
                    sh 'npm ci'
                    
                    // Add backend testing step here if tests are implemented
                    // echo 'Running Backend Tests...'
                    // sh 'npm test'
                }
            }
        }

        stage('Frontend: Install & Build') {
            steps {
                dir('frontend') {
                    echo 'Installing Frontend Dependencies...'
                    sh 'npm ci'
                    
                    // Add frontend testing step here if tests are implemented
                    // echo 'Running Frontend Tests...'
                    // sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
                    
                    echo 'Building Angular Application...'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to Firebase') {
            // Ideally, you only want to deploy on the main branch
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to Firebase Hosting...'
                // You will need to install firebase-tools globally on the Jenkins worker
                // or use npx. We use npx here for better reliability without global installs.
                // It requires the FIREBASE_TOKEN environment variable to be set in Jenkins.
                sh 'npx firebase-tools deploy --only hosting,firestore:rules --non-interactive --token $FIREBASE_TOKEN'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            // Optional: Archive artifacts or clean up workspace
            // cleanWs()
        }
        success {
            echo 'Deployment Successful! 🎉'
            // Add notification integrations here (Slack, Email, etc.)
        }
        failure {
            echo 'Deployment Failed! 🚨'
            // Add failure notification integrations here
        }
    }
}
