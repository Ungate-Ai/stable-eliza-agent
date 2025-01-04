pipeline {
    agent {
        kubernetes {
            cloud 'Jenkins-K8-Agent-Orchestration'
            yamlFile 'template.yaml'
        }
    }
    environment {
        KUBECONFIG = '/k8.yaml'
        IMAGE_NAME = 'registry.digitalocean.com/ungate/mematrix-architect:development'
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
        stage('Restart with Kubectl') {
            steps {
                container(name: 'kubectl', shell: '/bin/sh') {
                    script {
                        sh """
                        #!/bin/sh
                        export KUBECONFIG=${KUBECONFIG}
                        kubectl config use-context 'do-blr1-k8s-ungate-init'
                        kubectl apply -f deployment.yaml
                        kubectl rollout restart deployment architect -n default
                        kubectl rollout restart deployment krakend-deployment -n default
                        """
                    }
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
