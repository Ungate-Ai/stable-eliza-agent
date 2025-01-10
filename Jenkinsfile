pipeline {
    agent {
        kubernetes {
            cloud 'Jenkins-K8-Agent-Orchestration'
            yamlFile 'template.yaml'
        }
    }
    environment {
        KUBECONFIG = '/k8.yaml'
        IMAGE_NAME = 'registry.digitalocean.com/ungate/common-agent-ungate:development'
    }
    stages {
        stage('Build and Push Image with Kaniko') {
            steps {
                container(name: 'kaniko', shell: '/busybox/sh') {
                    script {
                        def currentDir = sh(script: 'pwd', returnStdout: true).trim()
                        sh """
                        #!/busybox/sh
                        /kaniko/executor --dockerfile=${currentDir}/Dockerfile \
                            --context=${currentDir} \
                            --build-arg=KUBECONFIG=${KUBECONFIG} \
                            --destination=${IMAGE_NAME} \
                            --insecure
                        """
                    }
                }
            }
        }
    }
    post {
        failure {
            echo 'Build failed!'
        }
        success {
            echo 'Build succeeded!'
        }
    }
}
