pipeline {
    agent any

    environment {
        PROJECT_DIR  = '/root/event-invitation-system'
        BRANCH       = 'feature/dev-v1'
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {

        stage('Pull Latest Code') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    git fetch origin
                    git checkout ${BRANCH}
                    git pull origin ${BRANCH}
                """
            }
        }

        stage('Validate Environment') {
            steps {
                sh """
                    if [ ! -f ${PROJECT_DIR}/.env ]; then
                        echo '================================================================'
                        echo ' ERROR: .env file not found at ${PROJECT_DIR}/.env'
                        echo ' Copy .env.example to .env and fill in the production values.'
                        echo '================================================================'
                        exit 1
                    fi
                    echo '.env file found.'
                """
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} build backend
                """
            }
        }

        stage('Restart Backend') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} up -d --no-deps backend
                """
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 40'
                sh 'curl -sf http://172.17.0.1:8090/api/actuator/health | grep -q \'"status":"UP"\''
                echo 'Health check passed.'
            }
        }
    }

    post {
        success {
            echo '=========================================='
            echo ' Backend deployed OK!'
            echo ' API      : http://95.216.188.135:8090/api'
            echo ' Frontend : https://dynamic-event-invitation.vercel.app'
            echo '=========================================='
        }
        failure {
            echo 'Deployment FAILED. Showing backend logs:'
            sh "cd ${PROJECT_DIR} && docker compose logs --tail=100 backend || true"
        }
        always {
            sh "cd ${PROJECT_DIR} && docker compose ps || true"
        }
    }
}
