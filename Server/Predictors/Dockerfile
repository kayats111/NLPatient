FROM continuumio/miniconda3

WORKDIR /app

COPY . /app

RUN conda env create -f environment.yml
RUN echo "source activate nlpatient" > ~/.bashrc
ENV PATH /opt/conda/envs/nlpatient/bin:$PATH

CMD ["python", "API.py"]