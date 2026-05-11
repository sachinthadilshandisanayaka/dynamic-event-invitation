pipeline {
    agent any

    environment {
        PROJECT_DIR  = '/root/event-invitation-system'
        BRANCH       = 'release_v1'
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
                        echo ' Required: VITE_API_URL, CORS_ALLOWED_ORIGINS, JWT_SECRET'
                        echo '================================================================'
                        exit 1
                    fi
                    echo '.env file found.'
                """
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} down --remove-orphans || true
                """
            }
        }

        stage('Build & Deploy') {
            steps {
                sh """
                    cd ${PROJECT_DIR}
                    docker compose -f ${COMPOSE_FILE} up -d --build
                """
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 40'
                // Jenkins runs in its own container — use Docker bridge gateway (172.17.0.1) to reach host ports
                sh 'curl -sf http://172.17.0.1:8090/api/actuator/health | grep -q \'"status":"UP"\''
                sh 'curl -sf -o /dev/null -w "%{http_code}" http://172.17.0.1:8091 | grep -q 200'
                echo 'All health checks passed.'
            }
        }
    }

    post {
        success {
            echo '=========================================='
            echo ' Event Invitation System deployed OK!'
            echo ' Frontend : http://95.216.188.135:8091'
            echo ' Backend  : http://95.216.188.135:8090/api'
            echo '=========================================='
        }
        failure {
            echo 'Deployment FAILED. Showing last 100 log lines per service:'
            sh "cd ${PROJECT_DIR} && docker compose logs --tail=100 || true"
        }
        always {
            sh "cd ${PROJECT_DIR} && docker compose ps || true"
        }
    }
}
