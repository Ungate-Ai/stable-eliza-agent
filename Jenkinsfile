pipeline {
    agent any

    environment {
        ENV_FILE = "/var/jenkins_home/achitect.env"
        KUBECONFIG = '/var/jenkins_home/kube8.yaml'
    }

    stages {
        stage('Prepare Environment') {
            steps {
                script {
                    def currentDir = sh(script: 'pwd', returnStdout: true).trim()
                    echo "Current directory: ${currentDir}"
                    sh 'mkdir -p /home/jenkins/.kube'
                    sh "cat ${ENV_FILE} > ${currentDir}/achitect.env"
                }
            }
        }
        stage('Docker Installation') {
            steps {
                script {
                    echo "Installing Docker..."
                    sh """
                        apt update
                        apt install -y apt-transport-https ca-certificates curl software-properties-common
                        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
                        echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable" > /etc/apt/sources.list.d/docker.list
                        apt update
                        apt install -y docker-ce docker-ce-cli containerd.io
                    """
                }
            }
        }

        stage('Docker Build and Push') {
            steps {
                script {
                    def imageName = "registry.digitalocean.com/ungate/architect-ungate:development"
                    echo "Building and pushing Docker image..."
                    def DOCKER_USERNAME = sh(script: "cat /var/jenkins_home/DOCR_USERNAME.env", returnStdout: true).trim()
                    def DOCR_TOKEN = sh(script: "cat /var/jenkins_home/DOCR_TOKEN.env", returnStdout: true).trim()

                    echo "DOCKER_USERNAME: ${DOCKER_USERNAME}"
                    echo "DOCR_TOKEN is set (but not displayed for security)"
                    sh """
                        echo "Attempting Docker login..."
                        echo '${DOCR_TOKEN}' | docker -H tcp://localhost:2375 login -u '${DOCKER_USERNAME}' --password-stdin registry.digitalocean.com
                        docker -H tcp://localhost:2375 build -t ${imageName} .
                        docker -H tcp://localhost:2375 push ${imageName}

                        # Get the image ID
                        IMAGE_ID=\$(docker -H tcp://localhost:2375 images -q ${imageName})
                        echo "Pushing complete. Removing image with ID: \$IMAGE_ID"

                        # Remove the image by ID
                        docker -H tcp://localhost:2375 rmi \$IMAGE_ID
                    """
                }
            }
        }


        stage('Kubectl Build') {
            steps {
                script {
                    echo "Checking if kubectl is installed..."
                    echo "kubectl not found. Installing kubectl..."
                    sh """
                    curl -LO "https://dl.k8s.io/release/v1.27.4/bin/linux/amd64/kubectl" &&
                    chmod +x kubectl &&
                    mv kubectl /usr/local/bin/kubectl
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    def currentDir = sh(script: 'pwd', returnStdout: true).trim()
                    echo "Current directory: ${currentDir}"
                    echo "Deploying to Kubernetes..."
                    sh 'export KUBECONFIG=${KUBECONFIG}'
                    sh 'kubectl config get-contexts'
                    sh 'kubectl config use-context do-blr1-k8s-ungate-init'
                    def DOCKER_USERNAME = sh(script: "cat /var/jenkins_home/DOCR_USERNAME.env", returnStdout: true).trim()
                    def DOCR_TOKEN = sh(script: "cat /var/jenkins_home/DOCR_TOKEN.env", returnStdout: true).trim()
                    echo "DOCKER_USERNAME: ${DOCKER_USERNAME}"
                    echo "DOCR_TOKEN is set (but not displayed for security)"
                    def secretExists = sh(script: 'kubectl get secret docker-secret', returnStatus: true)
                    if (secretExists != 0) {
                        echo "Creating Kubernetes secret for Docker registry..."
                        sh """
                            kubectl create secret docker-registry docker-secret \
                                --docker-server=registry.digitalocean.com \
                                --docker-username="${DOCKER_USERNAME}" \
                                --docker-password="${DOCR_TOKEN}" \
                                --docker-email="${DOCKER_USERNAME}"
                        """
                    } else {
                        echo "Docker secret already exists."
                    }
                   echo "Applying Kubernetes deployment..."
                    sh "kubectl create configmap defaultcharacter --from-file=${currentDir}/kaingaroo.character.json -o yaml --dry-run=client | kubectl apply -f -"
                    sh "kubectl apply -f ${currentDir}/deployment.yaml"
                    sh "kubectl apply -f ${currentDir}/service.yaml"
                    sh 'kubectl rollout restart deployment aliza-deployment'
                }
            }
        }

    }

    post {
        failure {
            echo 'Build or Deploy failed!'
        }
        success {
            echo 'Build and Deploy succeeded!'
        }
    }
}